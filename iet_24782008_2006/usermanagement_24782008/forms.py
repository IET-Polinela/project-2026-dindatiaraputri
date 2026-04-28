from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CitizenRegistrationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("username", "email") # Tambahkan field lain jika ada

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_admin = False  # Memastikan otomatis bukan admin
        user.is_member = True
        if commit:
            user.save()
        return user