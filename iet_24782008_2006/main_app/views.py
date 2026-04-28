from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Report
from .forms import ReportForm


# 🔐 ADMIN ONLY MIXIN (WAJIB)
class AdminOnlyMixin:
    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu!")
            return redirect('login')

        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin.")
            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


# 1. READ (LIST) - Semua boleh
class ReportListView(ListView):
    model = Report
    template_name = 'laporan/list.html'
    context_object_name = 'reports'
    ordering = ['-created_at']


# 2. DETAIL - Semua boleh
class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'


# 3. CREATE - 🔥 ADMIN ONLY
class ReportCreateView(AdminOnlyMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil dibuat ✅")
        return super().form_valid(form)


# 4. UPDATE - 🔥 ADMIN ONLY
class ReportUpdateView(AdminOnlyMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.info(self.request, "Laporan berhasil diperbarui ✏️")
        return super().form_valid(form)


# 5. DELETE - 🔥 ADMIN ONLY
class ReportDeleteView(AdminOnlyMixin, DeleteView):
    model = Report
    template_name = 'main_app/confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def delete(self, request, *args, **kwargs):
        messages.error(self.request, "Laporan berhasil dihapus 🗑️")
        return super().delete(request, *args, **kwargs)


# 6. UPDATE STATUS - 🔥 ADMIN ONLY
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