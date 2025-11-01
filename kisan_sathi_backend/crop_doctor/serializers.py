from rest_framework import serializers
from .models import Analysis, AnalysisImage


class AnalysisImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisImage
        fields = ["id", "image", "index"]


class AnalysisSerializer(serializers.ModelSerializer):
    images = AnalysisImageSerializer(many=True, read_only=True)

    class Meta:
        model = Analysis
        fields = ["id", "crop_type", "request_language", "result", "images", "created_at"]


