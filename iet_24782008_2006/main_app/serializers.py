from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Report

# Memanggil Custom User Model yang digunakan
User = get_user_model()


# ==========================================
# 1. REGISTER SERIALIZER
# ==========================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


# ==========================================
# 2. REPORT SERIALIZER
# ==========================================
class ReportSerializer(serializers.ModelSerializer):
    # Menggunakan SerializerMethodField untuk menyamarkan nama asli warga menjadi anonim
    reporter = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'created_at',
            'updated_at'
        ]
        # Memastikan field reporter tidak perlu diisi manual via JSON input saat POST/PUT
        read_only_fields = ['reporter']

    def get_reporter(self, obj):
        # Mengembalikan nama anonim untuk pelapor sesuai kebutuhan aplikasimu
        return "Warga Anonim"