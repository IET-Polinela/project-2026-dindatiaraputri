from django.db.models import Q
from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

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
        if not user or user.is_anonymous:
            return Report.objects.none()

        queryset = Report.objects.all().order_by('-updated_at')
        tab = self.request.query_params.get('tab')

        # ----------------- ADMIN -----------------
        # Admin tidak boleh melihat draft citizen
        if user.is_staff:
            return queryset.exclude(status='DRAFT')

        # ----------------- CITIZEN -----------------
        # Tab utama: draft milik sendiri + semua laporan yang sudah bukan draft
        if tab == 'my_reports':
            return queryset.filter(
                Q(reporter=user) | ~Q(status='DRAFT')
            ).distinct()

        # Tab feed kota: citizen melihat semua laporan yang sudah bukan draft
        if tab == 'feed':
            return queryset.exclude(status='DRAFT')

        # Default aman: draft sendiri boleh terlihat, draft orang lain tidak pernah terlihat
        return queryset.filter(
            Q(reporter=user) | ~Q(status='DRAFT')
        ).distinct()

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


@extend_schema(exclude=True)
class WhoAmI(APIView):
    """Sederhana API untuk mengembalikan informasi user saat ini (dipakai frontend)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'is_staff': user.is_staff,
            'is_admin': getattr(user, 'is_admin', False),
        })
