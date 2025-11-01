from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Farmer


@admin.register(Farmer)
class FarmerAdmin(UserAdmin):
    list_display = ['phone', 'first_name', 'last_name', 'email', 'district', 'village', 'is_verified']
    list_filter = ['is_verified', 'district', 'created_at']
    search_fields = ['phone', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('phone', 'username', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'email', 'profile_picture')}),
        ('Location', {'fields': ('district', 'taluk', 'village')}),
        ('Farming', {'fields': ('land_size', 'crops_grown')}),
        ('Settings', {'fields': ('preferred_language', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'fields': ('phone', 'email', 'first_name', 'last_name', 'password1', 'password2', 'district', 'village'),
        }),
    )
