from django.db import models
from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer, RegisterSerializer


# =====================================================================
# 1. REPORT VIEWSET (Mengatur CRUD & Hak Akses Laporan)
# =====================================================================
class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ==========================================
    # LIST & DETAIL
    # ==========================================
    def get_queryset(self):
        user = self.request.user

        # Jika belum login
        if not user or user.is_anonymous:
            return Report.objects.none()

        # ----------------- ADMIN -----------------
        # Admin lihat semua kecuali DRAFT
        if user.is_staff:
            return Report.objects.exclude(status='DRAFT')

        # ----------------- CITIZEN -----------------
        # Citizen hanya lihat report miliknya sendiri
        return Report.objects.filter(reporter=user)

    # ==========================================
    # CREATE
    # ==========================================
    def create(self, request, *args, **kwargs):
        # Admin tidak boleh create
        if request.user.is_staff:
            return Response(
                {
                    'message': 'Admin tidak boleh membuat laporan! ❌'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Otomatis set reporter dari user yang login
        serializer.save(reporter=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    # ==========================================
    # UPDATE
    # ==========================================
    def update(self, request, *args, **kwargs):
        report = self.get_object()

        # ----------------- ADMIN -----------------
        if request.user.is_staff:
            status_value = request.data.get('status')

            # Admin hanya boleh ubah status
            if not status_value or len(request.data.keys()) > 1:
                return Response(
                    {
                        'message': 'Admin hanya boleh mengubah status laporan saja! ❌'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            report.status = status_value
            report.save()

            serializer = self.get_serializer(report)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        # ----------------- CITIZEN -----------------
        else:
            # Hanya owner
            if report.reporter != request.user:
                return Response(
                    {
                        'message': 'Akses ditolak! Ini bukan laporan milik Anda. ❌'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Hanya draft boleh edit
            if report.status != 'DRAFT':
                return Response(
                    {
                        'message': 'Laporan tidak bisa diubah karena sudah diproses Admin! 🔒'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            return super().update(request, *args, **kwargs)

    # ==========================================
    # DELETE
    # ==========================================
    def destroy(self, request, *args, **kwargs):
        report = self.get_object()

        # Admin tidak boleh delete
        if request.user.is_staff:
            return Response(
                {
                    'message': 'Admin tidak boleh menghapus laporan masyarakat! ❌'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Hanya owner
        if report.reporter != request.user:
            return Response(
                {
                    'message': 'Akses ditolak! Ini bukan laporan milik Anda. ❌'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Hanya draft boleh delete
        if report.status != 'DRAFT':
            return Response(
                {
                    'message': 'Laporan tidak bisa dihapus karena sudah diproses Admin! 🔒'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


# =====================================================================
# 2. REGISTER VIEW (Mengatur Pendaftaran Akun Baru)
# =====================================================================
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    # Mengizinkan siapa saja (belum login) untuk mendaftar akun baru
    permission_classes = [permissions.AllowAny]