from io import BytesIO
from typing import List, Optional, Tuple

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from .models import Analysis, AnalysisImage
from .serializers import AnalysisSerializer


# ==== TensorFlow Integration (with safe fallback) ====
_TF_MODEL = None
_TFHUB_LAYER = None
_TF_INPUT_SIZE: Tuple[int, int] = (224, 224)

def _load_tf_model() -> Optional[object]:
    global _TF_MODEL
    global _TFHUB_LAYER
    if _TF_MODEL is not None or _TFHUB_LAYER is not None:
        return _TF_MODEL or _TFHUB_LAYER
    try:
        import os
        import tensorflow as tf  # type: ignore
        # Try TF Hub first if handle provided
        hub_handle = os.environ.get("CROP_DOCTOR_TFHUB_HANDLE")
        if hub_handle:
            import tensorflow_hub as hub  # type: ignore
            _TFHUB_LAYER = hub.KerasLayer(hub_handle)
            # Assume 224 if not specified
            return _TFHUB_LAYER
        model_path = os.environ.get("CROP_DOCTOR_MODEL_PATH")
        if not model_path:
            return None
        _TF_MODEL = tf.keras.models.load_model(model_path)
        # Optional: infer input size from model if possible
        try:
            shape = _TF_MODEL.input_shape
            if isinstance(shape, (list, tuple)) and len(shape) >= 4:
                # (None, H, W, C)
                h, w = shape[1], shape[2]
                if isinstance(h, int) and isinstance(w, int):
                    global _TF_INPUT_SIZE
                    _TF_INPUT_SIZE = (w, h)
        except Exception:
            pass
        return _TF_MODEL
    except Exception:
        return None


def _predict_with_tf(image_paths: List[str], crop_type: str):
    """Return list of prediction dicts using TensorFlow model or None if unavailable."""
    model_or_layer = _load_tf_model()
    if model_or_layer is None:
        return None
    try:
        import numpy as np  # type: ignore
        from PIL import Image  # type: ignore
        import os

        batch = []
        for p in image_paths:
            img = Image.open(p).convert("RGB")
            img = img.resize(_TF_INPUT_SIZE)
            arr = np.asarray(img, dtype=np.float32) / 255.0
            batch.append(arr)
        x = np.stack(batch, axis=0)
        # Support tfhub layer (callable) and keras model
        if hasattr(model_or_layer, "predict"):
            probs = model_or_layer.predict(x, verbose=0)
        else:
            # Assume hub layer signature: returns logits
            probs = model_or_layer(x)
            # Convert EagerTensor to numpy
            probs = getattr(probs, "numpy", lambda: probs)()
        if probs.ndim == 1:
            probs = probs[:, None]
        # Argmax per sample
        indices = probs.argmax(axis=1)
        confidences = probs.max(axis=1) * 100.0

        # Class mapping with bilingual metadata
        # If using TFHub cassava classifier, use 5-class mapping
        hub_handle = os.environ.get("CROP_DOCTOR_TFHUB_HANDLE", "").lower()
        if "cassava" in hub_handle:
            CLASS_MAP = {
                0: {
                    "key": "cassava_bacterial_blight",
                    "disease": {"en": "Cassava Bacterial Blight (CBB)", "kn": "ಸಾವುಗಡ್ಡೆ ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಬ್ಲೈಟ್"},
                    "cause": {"en": "Xanthomonas axonopodis pv. manihotis infection.", "kn": "ಝಾಂಥೋಮೋನಾಸ್ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕು."},
                    "treatment": {
                        "immediate": {"en": ["Remove infected leaves"], "kn": ["ಬಾಧಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ"]},
                        "chemical": {"en": ["Copper-based bactericides as per label"], "kn": ["ತಾಮ್ರ ಆಧಾರಿತ ಬ್ಯಾಕ್ಟಿರಿಸೈಡ್ (ಲೇಬಲ್ ಪ್ರಕಾರ)"]},
                        "organic": {"en": ["Sanitation and pruning"], "kn": ["ಸ್ವಚ್ಛತೆ ಮತ್ತು ಕತ್ತರಿಸುವಿಕೆ"]},
                    },
                    "prevention": {"en": ["Use clean planting material"], "kn": ["ಸ್ವಚ್ಛ ಬಿತ್ತನೆ ವಸ್ತು ಬಳಸಿ"]},
                    "severity": "high",
                },
                1: {
                    "key": "cassava_brown_streak_disease",
                    "disease": {"en": "Cassava Brown Streak Disease (CBSD)", "kn": "ಸಾವುಗಡ್ಡೆ ಬ್ರೌನ್ ಸ್ಟ್ರೀಕ್ ರೋಗ"},
                    "cause": {"en": "Ipomovirus infection spread by whiteflies.", "kn": "ವೈಟ್‌ಫ್ಲೈಗಳ ಮೂಲಕ ಹರಡುವ ಐಪೊಮೋವೈರಸ್ ಸೋಂಕು."},
                    "treatment": {
                        "immediate": {"en": ["Rogue and destroy infected plants"], "kn": ["ಬಾಧಿತ ಸಸಿಗಳನ್ನು ತೆಗೆದುಹಾಕಿ"]},
                        "chemical": {"en": ["Vector management as per IPM"], "kn": ["ವೈಕ್ಟರ್ ನಿರ್ವಹಣೆ (IPM) ಪ್ರಕಾರ"]},
                        "organic": {"en": ["Neem-based sprays"], "kn": ["ನೀಮ್ ಆಧಾರಿತ ಸಿಂಪಡಣೆ"]},
                    },
                    "prevention": {"en": ["Resistant varieties"], "kn": ["ರೋಗ ನಿರೋಧಕ ತಳಿಗಳು"]},
                    "severity": "high",
                },
                2: {
                    "key": "cassava_green_mottle",
                    "disease": {"en": "Cassava Green Mottle (CGM)", "kn": "ಸಾವುಗಡ್ಡೆ ಹಸಿರು ಮೋಟಲ್"},
                    "cause": {"en": "Viral disease causing mottling.", "kn": "ಮೋಟ್ಲಿಂಗ್ ಉಂಟುಮಾಡುವ ವೈರಸ್ ರೋಗ."},
                    "treatment": {
                        "immediate": {"en": ["Remove infected material"], "kn": ["ಬಾಧಿತ ವಸ್ತುವನ್ನು ತೆಗೆದುಹಾಕಿ"]},
                        "chemical": {"en": ["Vector control"], "kn": ["ವೈಕ್ಟರ್ ನಿಯಂತ್ರಣ"]},
                        "organic": {"en": ["Neem extracts"], "kn": ["ನೀಮ್ ಸಾರು"]},
                    },
                    "prevention": {"en": ["Use certified cuttings"], "kn": ["ಪ್ರಮಾಣಿತ ಕಟ್‌ಟಿಂಗ್ ಬಳಸಿ"]},
                    "severity": "medium",
                },
                3: {
                    "key": "cassava_mosaic_disease",
                    "disease": {"en": "Cassava Mosaic Disease (CMD)", "kn": "ಸಾವುಗಡ್ಡೆ ಮೊಸಾಯಿಕ್ ರೋಗ"},
                    "cause": {"en": "Begomovirus transmitted by whiteflies.", "kn": "ವೈಟ್‌ಫ್ಲೈಗಳಿಂದ ಹರಡುವ ಬೇಗೊಮೋವೈರಸ್."},
                    "treatment": {
                        "immediate": {"en": ["Remove and destroy infected plants"], "kn": ["ಬಾಧಿತ ಸಸಿಗಳನ್ನು ತೆಗೆದುಹಾಕಿ"]},
                        "chemical": {"en": ["Vector management"], "kn": ["ವೈಕ್ಟರ್ ನಿರ್ವಹಣೆ"]},
                        "organic": {"en": ["Neem oil applications"], "kn": ["ನೀಮ್ ಎಣ್ಣೆ ಬಳಕೆ"]},
                    },
                    "prevention": {"en": ["Plant resistant varieties"], "kn": ["ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ನೆಡಿ"]},
                    "severity": "high",
                },
                4: {
                    "key": "healthy",
                    "disease": {"en": "Healthy", "kn": "ಆರೋಗ್ಯಕರ"},
                    "cause": {"en": "No disease detected.", "kn": "ಯಾವುದೇ ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ."},
                    "treatment": {
                        "immediate": {"en": ["No action needed"], "kn": ["ಯಾವುದೇ ಕ್ರಮ ಬೇಕಿಲ್ಲ"]},
                        "chemical": {"en": [], "kn": []},
                        "organic": {"en": [], "kn": []},
                    },
                    "prevention": {"en": ["Continue good agronomy"], "kn": ["ಉತ್ತಮ ಕೃಷಿ ಕ್ರಮ ಮುಂದುವರಿಸಿ"]},
                    "severity": "low",
                },
            }
        else:
            # Default 2-class example mapping
            CLASS_MAP = {
            0: {
                "key": "tomato_late_blight",
                "disease": {"en": "Tomato Late Blight", "kn": "ಟೊಮೇಟೊ ತಡವಾದ ಬ್ಲೈಟ್"},
                "cause": {
                    "en": "Fungus Phytophthora infestans thrives in cool, wet weather; spreads via splashes.",
                    "kn": "ಫಂಗಸ್ ಫೈಟೋಫ್ತೋರಾ ಇನ್ಫೆಸ್ಟಾನ್ಸ್ ತಂಪು, ಒದ್ದೆ ಹವಾಮಾನದಲ್ಲಿ ವಿಕಸಿಸುತ್ತದೆ; ನೀರಿನ ಸಿಂಪಡಣೆಯಿಂದ ಹರಡುತ್ತದೆ.",
                },
                "treatment": {
                    "immediate": {
                        "en": ["Remove infected leaves/fruits", "Improve air circulation", "Reduce watering frequency"],
                        "kn": ["ಬಾಧಿತ ಎಲೆ/ಕಾಯಿಗಳನ್ನು ತೆಗೆದುಹಾಕಿ", "ಗಾಳಿಯ ಸಂಚಲನ ಹೆಚ್ಚಿಸಿ", "ನೀರಿನ ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ"],
                    },
                    "chemical": {
                        "en": ["Mancozeb 75% WP (2g/L), every 7–10 days, evening spray"],
                        "kn": ["ಮ್ಯಾಂಕೋಜೆಬ್ 75% ಡಬ್ಲ್ಯೂಪಿ (2g/L), 7–10 ದಿನಗಳಿಗೆ ಒಮ್ಮೆ, ಸಂಜೆ ಸಿಂಪಡಣೆ"],
                    },
                    "organic": {
                        "en": ["Neem oil spray", "Copper-based fungicides", "Bordeaux mixture"],
                        "kn": ["ನೀಮ್ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ", "ತಾಮ್ರ ಆಧಾರಿತ ಫಂಗಿಸೈಡ್ಸ್", "ಬೋರ್ಡೊ ಮಿಶ್ರಣ"],
                    },
                },
                "prevention": {
                    "en": ["Use resistant varieties", "Avoid overhead watering", "Maintain plant spacing", "Crop rotation"],
                    "kn": ["ರೋಗನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ", "ಮೇಲಿನಿಂದ ನೀರಿನ ಸಿಂಪಡಣೆ ತಪ್ಪಿಸಿ", "ಸಸಿಗಳಿಗೆ ಸಮರ್ಪಕ ಅಂತರ ನೀಡಿ", "ಬೆಳೆ ಪರಿವರ್ತನೆ"],
                },
                "severity": "high",
            },
            1: {
                "key": "leaf_spot",
                "disease": {"en": "Leaf Spot", "kn": "ಎಲೆ ಕಲೆ"},
                "cause": {
                    "en": "Fungal or bacterial spots under humid conditions; spreads via wind and water.",
                    "kn": "ತೇವಾಂಶದಲ್ಲಿ ಹುಳು/ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಲೆಗಳು; ಗಾಳಿ ಮತ್ತು ನೀರಿನ ಮೂಲಕ ಹರಡುತ್ತವೆ.",
                },
                "treatment": {
                    "immediate": {"en": ["Remove affected leaves"], "kn": ["ಬಾಧಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ"]},
                    "chemical": {"en": ["Chlorothalonil spray as per label"], "kn": ["ಲೇಬಲ್‌ ಪ್ರಕಾರ ಕ್ಲೊರೊಥಾಲೊನಿಲ್ ಸಿಂಪಡಣೆ"]},
                    "organic": {"en": ["Neem oil"], "kn": ["ನೀಮ್ ಎಣ್ಣೆ"]},
                },
                "prevention": {
                    "en": ["Sanitize tools", "Avoid leaf wetness"],
                    "kn": ["ಉಪಕರಣಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ", "ಎಲೆಗಳ ಮೇಲೆ ನೀರು ತಡೆಯಿರಿ"],
                },
                "severity": "medium",
            },
            }

        results: List[dict] = []
        for idx, conf in zip(indices.tolist(), confidences.tolist()):
            meta = CLASS_MAP.get(int(idx), CLASS_MAP.get(1))
            results.append({
                "disease": meta["disease"],
                "confidence": round(float(conf), 1),
                "severity": meta.get("severity", "medium"),
                "cause": meta["cause"],
                "treatment": meta["treatment"],
                "prevention": meta["prevention"],
            })
        return results
    except Exception:
        return None


def _mock_model_predict(batch_count: int, crop_type: str):
    # Placeholder; replace with TensorFlow or HuggingFace model inference
    results: List[dict] = []
    for _ in range(batch_count):
        results.append({
            "disease": {
                "en": "Tomato Late Blight" if (crop_type.lower() if crop_type else "").find("tomato") >= 0 else "Leaf Spot",
                "kn": "ಟೊಮೇಟೊ ತಡವಾದ ಬ್ಲೈಟ್",
            },
            "confidence": 92,
            "severity": "high",
            "cause": {
                "en": "Fungus Phytophthora infestans thrives in cool, wet weather; spreads via splashes.",
                "kn": "ಫಂಗಸ್ ಫೈಟೋಫ್ತೋರಾ ಇನ್ಫೆಸ್ಟಾನ್ಸ್ ತಂಪು, ಒದ್ದೆ ಹವಾಮಾನದಲ್ಲಿ ವಿಕಸಿಸುತ್ತದೆ; ನೀರಿನ ಸಿಂಪಡಣೆಯಿಂದ ಹರಡುತ್ತದೆ.",
            },
            "treatment": {
                "immediate": {
                    "en": [
                        "Remove infected leaves/fruits",
                        "Improve air circulation",
                        "Reduce watering frequency",
                    ],
                    "kn": [
                        "ಬಾಧಿತ ಎಲೆ/ಕಾಯಿಗಳನ್ನು ತೆಗೆದುಹಾಕಿ",
                        "ಗಾಳಿಯ ಸಂಚಲನ ಹೆಚ್ಚಿಸಿ",
                        "ನೀರಿನ ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ",
                    ],
                },
                "chemical": {
                    "en": ["Mancozeb 75% WP (2g/L), every 7–10 days, evening spray"],
                    "kn": ["ಮ್ಯಾಂಕೋಜೆಬ್ 75% ಡಬ್ಲ್ಯೂಪಿ (2g/L), 7–10 ದಿನಗಳಿಗೆ ಒಮ್ಮೆ, ಸಂಜೆ ಸಿಂಪಡಣೆ"],
                },
                "organic": {
                    "en": ["Neem oil spray", "Copper-based fungicides", "Bordeaux mixture"],
                    "kn": ["ನೀಮ್ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ", "ತಾಮ್ರ ಆಧಾರಿತ ಫಂಗಿಸೈಡ್ಸ್", "ಬೋರ್ಡೊ ಮಿಶ್ರಣ"],
                },
            },
            "prevention": {
                "en": [
                    "Use resistant varieties",
                    "Avoid overhead watering",
                    "Maintain plant spacing",
                    "Crop rotation",
                ],
                "kn": [
                    "ರೋಗನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ",
                    "ಮೇಲಿನಿಂದ ನೀರಿನ ಸಿಂಪಡಣೆ ತಪ್ಪಿಸಿ",
                    "ಸಸಿಗಳಿಗೆ ಸಮರ್ಪಕ ಅಂತರ ನೀಡಿ",
                    "ಬೆಳೆ ಪರಿವರ್ತನೆ",
                ],
            },
        })
    return results


@method_decorator(csrf_exempt, name="dispatch")
class AnalyzeView(APIView):
    # Consider adding authentication later
    def post(self, request):
        crop_type = request.data.get("crop_type", "")
        language = request.data.get("language", "en")
        files = request.FILES.getlist("images")

        if not files:
            return Response({"success": False, "message": "No images uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        if len(files) > 5:
            return Response({"success": False, "message": "Maximum 5 images allowed"}, status=status.HTTP_400_BAD_REQUEST)

        # Create analysis record
        analysis = Analysis.objects.create(
            farmer=request.user if request.user and request.user.is_authenticated else None,
            crop_type=crop_type,
            request_language=language,
        )

        # Save images
        for idx, f in enumerate(files):
            AnalysisImage.objects.create(analysis=analysis, image=f, index=idx)

        # Run TensorFlow model if available; else fallback to mock
        image_paths = []
        for img in analysis.images.order_by("index").all():
            image_paths.append(img.image.path)

        predictions = _predict_with_tf(image_paths, crop_type)
        if predictions is None:
            predictions = _mock_model_predict(len(files), crop_type)
        analysis.result = {"items": predictions}
        analysis.save()

        data = AnalysisSerializer(analysis).data
        return Response({"success": True, "analysis": data}, status=status.HTTP_200_OK)


class ReportPDFView(APIView):
    def get(self, request, pk: int):
        try:
            analysis = Analysis.objects.get(pk=pk)
        except Analysis.DoesNotExist:
            return Response({"success": False, "message": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

        # Build simple PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        top = height - 20 * mm
        left = 20 * mm
        line = top

        p.setFont("Helvetica-Bold", 16)
        p.drawString(left, line, "Kisan Sathi - Crop Doctor Report")
        line -= 10 * mm

        p.setFont("Helvetica", 10)
        p.drawString(left, line, f"Crop Type: {analysis.crop_type or '-'}")
        line -= 6 * mm
        p.drawString(left, line, f"Date: {analysis.created_at.strftime('%Y-%m-%d %H:%M')}")
        line -= 10 * mm

        items = (analysis.result or {}).get("items", [])
        for idx, item in enumerate(items):
            p.setFont("Helvetica-Bold", 12)
            p.drawString(left, line, f"Image {idx + 1}")
            line -= 6 * mm

            p.setFont("Helvetica", 10)
            p.drawString(left, line, f"Disease: {item.get('disease', {}).get('en', '-')}")
            line -= 5 * mm
            p.drawString(left, line, f"Confidence: {item.get('confidence', '-')}%  Severity: {item.get('severity', '-').upper()}")
            line -= 6 * mm

            # Cause
            p.setFont("Helvetica-Bold", 11)
            p.drawString(left, line, "Cause")
            line -= 5 * mm
            p.setFont("Helvetica", 10)
            p.drawString(left, line, item.get('cause', {}).get('en', '-'))
            line -= 6 * mm

            # Treatment
            p.setFont("Helvetica-Bold", 11)
            p.drawString(left, line, "Treatment")
            line -= 5 * mm
            p.setFont("Helvetica", 10)
            for section in ("immediate", "chemical", "organic"):
                values = item.get("treatment", {}).get(section, {}).get("en", [])
                if values:
                    p.drawString(left, line, f"- {section.capitalize()}")
                    line -= 5 * mm
                    for val in values:
                        p.drawString(left + 6 * mm, line, f"• {val}")
                        line -= 5 * mm
            # Prevention
            p.setFont("Helvetica-Bold", 11)
            p.drawString(left, line, "Prevention")
            line -= 5 * mm
            p.setFont("Helvetica", 10)
            for val in item.get("prevention", {}).get("en", [])[:6]:
                p.drawString(left + 6 * mm, line, f"• {val}")
                line -= 5 * mm

            line -= 6 * mm
            if line < 40 * mm:
                p.showPage()
                line = top

        p.showPage()
        p.save()
        pdf = buffer.getvalue()
        buffer.close()
        resp = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = f"attachment; filename=analysis_{analysis.id}.pdf"
        return resp

from django.shortcuts import render

# Create your views here.
