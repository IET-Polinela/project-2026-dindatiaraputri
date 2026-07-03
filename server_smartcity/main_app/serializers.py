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
    # Field 'reporter' SELALU disamarkan menjadi "Warga Anonim" (hardcoded),
    # dipakai untuk tampilan publik/feed kota.
    reporter = serializers.SerializerMethodField()

    # Field 'reporter_name' menampilkan username ASLI, tapi HANYA jika
    # request.user adalah pemilik laporan tersebut. Dipakai untuk tab
    # "my_reports" (laporan milik sendiri).
    reporter_name = serializers.SerializerMethodField()

    # 🌟 FIELD UNTUK FIGURE 2: Menentukan hak kepemilikan draf
    is_owner = serializers.SerializerMethodField()

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
            'reporter_name',
            'created_at',
            'updated_at',
            'is_owner'  # Pendaftaran field di JSON output
        ]
        # Memastikan field berikut tidak perlu diisi manual via JSON input saat POST/PUT
        read_only_fields = ['reporter', 'reporter_name', 'created_at', 'updated_at', 'is_owner']

    def get_reporter(self, obj):
        # Field ini SELALU anonim, tanpa pengecualian — dipakai di Feed Kota
        # agar identitas pelapor tidak pernah bocor ke warga lain.
        return "Warga Anonim"

    def get_reporter_name(self, obj):
        # Field ini menampilkan nama asli HANYA untuk pemilik laporan.
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'author') and obj.author == request.user:
                return request.user.username
            elif hasattr(obj, 'reporter') and obj.reporter == request.user:
                return request.user.username

        # Untuk warga lain, tetap disamarkan
        return "Warga Anonim"

    # 🌟 FIX LOGIKA INTERAKSI & TOMBOL EDIT (SCREENSHOT 2 & 5)
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            # Mengecek field relasi User yang ada di Model Report kamu (bisa berupa author atau reporter)
            if hasattr(obj, 'author'):
                return obj.author == request.user
            elif hasattr(obj, 'reporter'):
                return obj.reporter == request.user
        return False