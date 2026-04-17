from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.contrib import messages  # 🔥 tambahan

from .models import Report
from .forms import ReportForm


# READ (LIST)
class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'
    ordering = ['-created_at']


# DETAIL
class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'


# CREATE
class ReportCreateView(CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Terima kasih atas laporannya 🙏")
        return super().form_valid(form)


# UPDATE
class ReportUpdateView(UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.info(self.request, "Laporan berhasil diperbarui ✏️")
        return super().form_valid(form)


# DELETE
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'main_app/confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def delete(self, request, *args, **kwargs):
        messages.error(self.request, "Laporan berhasil dihapus 🗑️")
        return super().delete(request, *args, **kwargs)


# UPDATE STATUS (WORKFLOW)
class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)

        new_status = request.POST.get('status')

        # 🔥 aturan workflow
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