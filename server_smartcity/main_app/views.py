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

# === REST FRAMEWORK EXTENSIONS ===
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .forms import ReportForm
from .models import Report
from .serializers import RegisterSerializer, ReportSerializer

User = get_user_model()


def visible_reports_for(user):
    queryset = Report.objects.all()

    if not user or user.is_anonymous:
        return queryset.exclude(status='DRAFT')

    if user.is_staff:
        return queryset.exclude(status='DRAFT')

    return queryset.filter(
        Q(reporter=user) | ~Q(status='DRAFT')
    ).distinct()

# 🌟 INSTRUKSI LAB: Paginasi dengan ukuran page_size = 10
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

# ==========================================
# 🚀 OPTIMIZED API VIEWSET (INSTRUKSI 1)
# ==========================================
class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        # 🌟 INSTRUKSI LAB: Diurutkan berdasarkan pembaruan terbaru (-updated_at)
        queryset = Report.objects.all().order_by('-updated_at')
        
        # Membaca parameter ?tab= dari URL
        tab = self.request.query_params.get('tab', None)

        if user.is_staff:
            return queryset.exclude(status='DRAFT')
        
        if tab == 'my_reports':
            # 🌟 INSTRUKSI LAB: kembalikan hanya laporan milik user yang sedang login
            return queryset.filter(
                Q(reporter=user) | ~Q(status='DRAFT')
            ).distinct()
            
        elif tab == 'feed':
            # 🌟 INSTRUKSI LAB: kembalikan laporan dari warga lain yang statusnya bukan DRAFT
            return queryset.exclude(status='DRAFT')
            
        else:
            # Default / Tab 'all': Gabungan laporan milik sendiri + laporan publik non-draft
            return queryset.filter(
                Q(reporter=user) | ~Q(status='DRAFT')
            ).distinct()

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


# ==========================================
# 🔐 AUTH & TEMPLATE VIEWS (BAWAAN SEBELUMNYA)
# ==========================================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class AdminOnlyMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu!")
            return redirect('login')
        if not getattr(request.user, 'is_admin', False) and not request.user.is_staff:
            messages.error(request, "Akses ditolak! Hanya admin.")
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)

class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'
    ordering = ['-created_at']

    def get_queryset(self):
        return visible_reports_for(self.request.user).order_by('-created_at')

class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'

    def get_queryset(self):
        return visible_reports_for(self.request.user)

class ReportCreateView(AdminOnlyMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')
    def form_valid(self, form):
        # Set the reporter to the currently logged-in user before saving
        action = self.request.POST.get('action')
        form.instance.reporter = self.request.user
        # Tindakan berdasarkan tombol yang diklik: draft atau submit
        if action == 'draft':
            form.instance.status = 'DRAFT'
            messages.success(self.request, "Laporan disimpan sebagai draft ✅")
        else:
            form.instance.status = 'REPORTED'
            messages.success(self.request, "Laporan berhasil dibuat ✅")
        return super().form_valid(form)

class ReportUpdateView(AdminOnlyMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')
    def form_valid(self, form):
        # Menangani tombol 'Simpan sebagai Draft' atau 'Simpan'
        action = self.request.POST.get('action')
        if action == 'draft':
            form.instance.status = 'DRAFT'
            messages.info(self.request, "Laporan disimpan sebagai draft ✏️")
        else:
            # Jika user memilih Simpan, set ke REPORTED
            form.instance.status = 'REPORTED'
            messages.info(self.request, "Laporan berhasil diperbarui ✏️")
        return super().form_valid(form)

class ReportDeleteView(AdminOnlyMixin, DeleteView):
    model = Report
    template_name = 'main_app/confirm_delete.html'
    success_url = reverse_lazy('report_list')
    def delete(self, request, *args, **kwargs):
        messages.error(self.request, "Laporan berhasil dihapus 🗑️")
        return super().delete(request, *args, **kwargs)

class ReportUpdateStatusView(AdminOnlyMixin, View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        valid_transitions = {'DRAFT': 'VERIFIED', 'VERIFIED': 'RESOLVED'}
        if report.status in valid_transitions and new_status == valid_transitions[report.status]:
            report.status = new_status
            report.save()
            messages.success(request, f"Status berhasil diperbarui ke {new_status} ✅")
        else:
            messages.warning(request, "Perubahan status tidak valid! ❌")
        return redirect('report_list')

def dashboard_page(request):
    return render(request, 'dashboard_24782008/dashboard.html')

def dashboard_data(request):
    reports = visible_reports_for(request.user)
    status_data = reports.values('status').annotate(total=Count('id'))
    category_data = reports.values('category').annotate(total=Count('id'))
    reported = reports.filter(status='REPORTED').order_by('-id')[:5]
    resolved = reports.filter(status='RESOLVED').order_by('-id')[:5]
    
    data = {
        "status": list(status_data),
        "category": list(category_data),
        "reported": list(reported.values('id', 'title', 'category', 'status')),
        "resolved": list(resolved.values('id', 'title', 'category', 'status')),
    }
    return JsonResponse(data)

def search_reports(request):
    query = request.GET.get('q', '')
    reports = visible_reports_for(request.user)
    if query:
        reports = reports.filter(Q(title__icontains=query) | Q(category__icontains=query) | Q(status__icontains=query))
    reports = reports.order_by('-id')[:20]
    return JsonResponse({'results': list(reports.values('id', 'title', 'category', 'status', 'location'))})

def report_detail_api(request, pk):
    report = get_object_or_404(visible_reports_for(request.user), pk=pk)
    data = {
        'id': report.id, 'title': report.title, 'category': report.category,
        'status': report.status, 'description': report.description, 'location': report.location,
        'created_at': report.created_at.strftime("%d %b %Y %H:%M") if report.created_at else ""
    }
    return JsonResponse(data)

def home_page(request):
    return render(request, 'main_app/home.html', {'reports': visible_reports_for(request.user).order_by('-id')})
