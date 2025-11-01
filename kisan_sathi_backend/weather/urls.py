from django.urls import path
from .views import WeatherSummaryView

app_name = 'weather'

urlpatterns = [
    path('summary/', WeatherSummaryView.as_view(), name='summary'),
]


