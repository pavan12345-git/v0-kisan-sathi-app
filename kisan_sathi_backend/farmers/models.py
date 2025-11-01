from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class Farmer(AbstractUser):
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    phone = PhoneNumberField(unique=True, region='IN')
    email = models.EmailField(unique=True)
    district = models.CharField(max_length=100)
    taluk = models.CharField(max_length=100)
    village = models.CharField(max_length=100)
    land_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    crops_grown = models.JSONField(default=list, blank=True)
    preferred_language = models.CharField(max_length=2, choices=[('en', 'English'), ('kn', 'Kannada')], default='kn')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['email', 'first_name']

    class Meta:
        db_table = 'farmers'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phone})"

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = str(self.phone).replace('+', '').replace(' ', '')
        super().save(*args, **kwargs)

# Create your models here.
