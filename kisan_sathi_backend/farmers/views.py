from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Farmer
from .serializers import FarmerRegistrationSerializer, LoginSerializer, FarmerProfileSerializer
from .utils import generate_otp, send_otp_sms, send_otp_email, verify_otp


class SignupAPIView(APIView):
    def post(self, request):
        serializer = FarmerRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            farmer = serializer.save()
            return Response({
                'success': True,
                'message': 'Registration successful.',
                'data': {'phone': str(farmer.phone), 'email': farmer.email}
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response({
                'success': False,
                'message': 'Phone and OTP required'
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data
            farmer = data['farmer']

            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'access_token': data['access_token'],
                    'refresh_token': data['refresh_token'],
                    'farmer': {
                        'id': farmer.id,
                        'name': f"{farmer.first_name} {farmer.last_name}",
                        'phone': str(farmer.phone),
                        'email': farmer.email,
                        'district': farmer.district,
                        'village': farmer.village,
                        'preferred_language': farmer.preferred_language
                    }
                }
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = FarmerProfileSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request):
        serializer = FarmerProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = Farmer.objects.get(phone=phone)
        except Farmer.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Farmer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        is_valid, message = verify_otp(farmer, otp)

        if is_valid:
            return Response({
                'success': True,
                'message': message
            })
        else:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
