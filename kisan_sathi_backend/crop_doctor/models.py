from django.db import models
from django.conf import settings


class Analysis(models.Model):
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="crop_analyses", on_delete=models.SET_NULL, null=True, blank=True
    )
    crop_type = models.CharField(max_length=100, blank=True, default="")
    request_language = models.CharField(max_length=8, blank=True, default="en")
    # Result JSON stores bilingual details: disease, confidence, cause, treatment, prevention
    result = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Analysis {self.id} - {self.crop_type}"


class AnalysisImage(models.Model):
    analysis = models.ForeignKey(Analysis, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="crop_doctor/")
    index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"AnalysisImage {self.id} for {self.analysis_id}"

from django.db import models

# Create your models here.
