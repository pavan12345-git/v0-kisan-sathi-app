from django.urls import path
from .views import AnalyzeView, ReportPDFView

app_name = 'crop_doctor'

urlpatterns = [
    path('analyze/', AnalyzeView.as_view(), name='analyze'),
    path('report/<int:pk>/', ReportPDFView.as_view(), name='report-pdf'),
]


