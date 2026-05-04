from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Count, Q  # 🔥 tambah Q

from .models import Report
from .forms import ReportForm


# 🔐 ADMIN ONLY MIXIN
class AdminOnlyMixin:
    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu!")
            return redirect('login')

        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin.")
            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


# 1. READ (LIST)
class ReportListView(ListView):
    model = Report
    template_name = 'laporan/list.html'
    context_object_name = 'reports'
    ordering = ['-created_at']


# 2. DETAIL
class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'


# 3. CREATE
class ReportCreateView(AdminOnlyMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil dibuat ✅")
        return super().form_valid(form)


# 4. UPDATE
class ReportUpdateView(AdminOnlyMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.info(self.request, "Laporan berhasil diperbarui ✏️")
        return super().form_valid(form)


# 5. DELETE
class ReportDeleteView(AdminOnlyMixin, DeleteView):
    model = Report
    template_name = 'main_app/confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def delete(self, request, *args, **kwargs):
        messages.error(self.request, "Laporan berhasil dihapus 🗑️")
        return super().delete(request, *args, **kwargs)


# 6. UPDATE STATUS
class ReportUpdateStatusView(AdminOnlyMixin, View):

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        if report.status == 'REPORTED' and new_status == 'VERIFIED':
            report.status = 'VERIFIED'
        elif report.status == 'VERIFIED' and new_status == 'IN_PROGRESS':
            report.status = 'IN_PROGRESS'
        elif report.status == 'IN_PROGRESS' and new_status == 'RESOLVED':
            report.status = 'RESOLVED'
        else:
            messages.warning(request, "Perubahan status tidak valid ❌")
            return redirect('report_list')

        report.save()
        messages.success(request, "Status berhasil diperbarui ✅")
        return redirect('report_list')


# =========================
# 📊 DASHBOARD
# =========================
def dashboard_page(request):
    return render(request, 'dashboard_24782008/dashboard.html')  # 🔥 FIX


def dashboard_data(request):
    status_data = Report.objects.values('status').annotate(total=Count('id'))
    category_data = Report.objects.values('category').annotate(total=Count('id'))

    reported = Report.objects.filter(status='REPORTED').order_by('-id')[:5]
    resolved = Report.objects.filter(status='RESOLVED').order_by('-id')[:5]

    data = {
        "status": list(status_data),
        "category": list(category_data),
        "reported": list(reported.values('title', 'category', 'status')),
        "resolved": list(resolved.values('title', 'category', 'status')),
    }

    return JsonResponse(data)

# =========================
# 🔍 LIVE SEARCH (BARU)
# =========================
def search_reports(request):
    query = request.GET.get('q', '')

    reports = Report.objects.filter(
        Q(title__icontains=query) |
        Q(category__icontains=query) |
        Q(status__icontains=query)
    )[:20]

    data = list(reports.values('id', 'title', 'category', 'status'))

    return JsonResponse({'results': data})


# =========================
# 📄 DETAIL MODAL (BARU)
# =========================
def report_detail_api(request, pk):
    report = get_object_or_404(Report, pk=pk)

    data = {
        'title': report.title,
        'category': report.category,
        'status': report.status,
        'description': report.description,
        'location': report.location,
    }

    return JsonResponse(data)