from django.urls import path
from .views import SignupAPIView, VerifyOTPView, LoginAPIView, ProfileView


app_name = 'farmers'


urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='signup'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
]


