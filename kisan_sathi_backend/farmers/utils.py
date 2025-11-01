import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def send_otp_sms(phone, otp):
    print(f"\n{'='*50}")
    print(f"SMS to {phone}: Your OTP is {otp}")
    print(f"{'='*50}\n")
    return True


def send_otp_email(email, otp, farmer_name):
    subject = 'Kisan Sathi - OTP Verification'
    message = f'Hello {farmer_name},\n\nYour OTP is: {otp}\n\nValid for 10 minutes.'
    try:
        send_mail(subject, message, 'noreply@kisansathi.com', [email])
        return True
    except:
        return False


def verify_otp(farmer, otp):
    if not farmer.otp or not farmer.otp_created_at:
        return False, "No OTP found"

    if timezone.now() > farmer.otp_created_at + timedelta(minutes=10):
        farmer.otp = ''
        farmer.save()
        return False, "OTP expired"

    if farmer.otp != otp:
        return False, "Invalid OTP"

    farmer.is_verified = True
    farmer.is_active = True
    farmer.otp = ''
    farmer.otp_created_at = None
    farmer.save()

    return True, "Verified successfully"


