from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Farmer
from rest_framework_simplejwt.tokens import RefreshToken


class FarmerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = Farmer
        fields = ['phone', 'email', 'first_name', 'last_name', 'password', 'password2', 
                  'district', 'taluk', 'village', 'land_size', 'crops_grown', 'preferred_language']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        # Register without OTP: mark active and verified immediately
        farmer = Farmer.objects.create(**validated_data, is_active=True, is_verified=True)
        farmer.set_password(password)
        farmer.save()
        return farmer


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')

        try:
            farmer = Farmer.objects.get(phone=phone)
        except Farmer.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not farmer.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        # OTP verification disabled: do not block login on is_verified

        refresh = RefreshToken.for_user(farmer)

        return {
            'farmer': farmer,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        }


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = ['id', 'phone', 'email', 'first_name', 'last_name', 'district', 
                  'taluk', 'village', 'land_size', 'crops_grown', 'preferred_language', 
                  'profile_picture', 'is_verified', 'created_at']
        read_only_fields = ['phone', 'is_verified', 'created_at']


