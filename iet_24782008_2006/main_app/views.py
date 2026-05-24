from django.contrib.auth import get_user_model
from django.contrib import messages
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import (
    get_object_or_404,
    redirect,
    render
)
from django.urls import reverse_lazy
from django.views import View

from django.views.generic import (
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
    DetailView
)

from rest_framework import generics

from .forms import ReportForm
from .models import Report
from .serializers import RegisterSerializer


# Custom User Model
User = get_user_model()


# =========================
# 🔐 AUTH & API VIEWS
# =========================

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer


# =========================
# 🛡️ ADMIN ONLY MIXIN
# =========================

class AdminOnlyMixin:

    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            messages.error(
                request,
                "Silakan login terlebih dahulu!"
            )

            return redirect('login')

        # Memastikan user memiliki atribut is_admin
        if not getattr(request.user, 'is_admin', False):

            messages.error(
                request,
                "Akses ditolak! Hanya admin."
            )

            return redirect('report_list')

        return super().dispatch(
            request,
            *args,
            **kwargs
        )


# =========================
# 📄 CRUD REPORT
# =========================

class ReportListView(ListView):

    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'
    ordering = ['-created_at']


class ReportDetailView(DetailView):

    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'


class ReportCreateView(
    AdminOnlyMixin,
    CreateView
):

    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):

        messages.success(
            self.request,
            "Laporan berhasil dibuat ✅"
        )

        return super().form_valid(form)


class ReportUpdateView(
    AdminOnlyMixin,
    UpdateView
):

    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):

        messages.info(
            self.request,
            "Laporan berhasil diperbarui ✏️"
        )

        return super().form_valid(form)


class ReportDeleteView(
    AdminOnlyMixin,
    DeleteView
):

    model = Report
    template_name = 'main_app/confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def delete(self, request, *args, **kwargs):

        messages.error(
            self.request,
            "Laporan berhasil dihapus 🗑️"
        )

        return super().delete(
            request,
            *args,
            **kwargs
        )


class ReportUpdateStatusView(
    AdminOnlyMixin,
    View
):

    def post(self, request, pk):

        report = get_object_or_404(
            Report,
            pk=pk
        )

        new_status = request.POST.get('status')

        # Logika transisi status laporan
        valid_transitions = {
            'REPORTED': 'VERIFIED',
            'VERIFIED': 'IN_PROGRESS',
            'IN_PROGRESS': 'RESOLVED'
        }

        if (
            report.status in valid_transitions and
            new_status == valid_transitions[report.status]
        ):

            report.status = new_status
            report.save()

            messages.success(
                request,
                f"Status berhasil diperbarui ke {new_status} ✅"
            )

        else:

            messages.warning(
                request,
                "Perubahan status tidak valid "
                "atau tidak sesuai urutan ❌"
            )

        return redirect('report_list')


# =========================
# 📊 DASHBOARD
# =========================

def dashboard_page(request):

    return render(
        request,
        'dashboard_24782008/dashboard.html'
    )


def dashboard_data(request):

    # Mengambil data untuk Chart.js
    status_data = (
        Report.objects
        .values('status')
        .annotate(total=Count('id'))
    )

    category_data = (
        Report.objects
        .values('category')
        .annotate(total=Count('id'))
    )

    # Mengambil data untuk tabel
    reported = (
        Report.objects
        .filter(status='REPORTED')
        .order_by('-id')[:5]
    )

    resolved = (
        Report.objects
        .filter(status='RESOLVED')
        .order_by('-id')[:5]
    )

    data = {
        "status": list(status_data),

        "category": list(category_data),

        "reported": list(
            reported.values(
                'id',
                'title',
                'category',
                'status'
            )
        ),

        "resolved": list(
            resolved.values(
                'id',
                'title',
                'category',
                'status'
            )
        ),
    }

    return JsonResponse(data)


# =========================
# 🔍 LIVE SEARCH
# =========================

def search_reports(request):

    query = request.GET.get('q', '')

    reports = Report.objects.all()

    if query:

        reports = reports.filter(
            Q(title__icontains=query) |
            Q(category__icontains=query) |
            Q(status__icontains=query)
        )

    reports = reports.order_by('-id')[:20]

    data = list(
        reports.values(
            'id',
            'title',
            'category',
            'status',
            'location'
        )
    )

    return JsonResponse({
        'results': data
    })


# =========================
# 📄 DETAIL MODAL API
# =========================

def report_detail_api(request, pk):

    report = get_object_or_404(
        Report,
        pk=pk
    )

    data = {
        'id': report.id,
        'title': report.title,
        'category': report.category,
        'status': report.status,
        'description': report.description,
        'location': report.location,

        'created_at': (
            report.created_at.strftime(
                "%d %b %Y %H:%M"
            )
            if hasattr(report, 'created_at')
            else ""
        )
    }

    return JsonResponse(data)


# =========================
# 🏠 HOME PAGE
# =========================

def home_page(request):

    reports = (
        Report.objects
        .all()
        .order_by('-id')
    )

    return render(
        request,
        'main_app/home.html',
        {
            'reports': reports
        }
    )