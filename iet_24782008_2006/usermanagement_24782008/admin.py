from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_admin', 'is_member', 'is_staff', 'is_superuser')
    list_filter = ('is_admin', 'is_member', 'is_staff')
    search_fields = ('username', 'email')