from django.urls import path
from .views import (
    ReportListView,
    ReportDetailView,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportUpdateStatusView,
    dashboard_page,
    dashboard_data,
    search_reports,
    report_detail_api,
    home_page
)

urlpatterns = [
    # HOME PAGE & REPORT LIST
    # Menggunakan home_page untuk kedua path agar fitur pencarian di home tidak error
    path('', home_page, name='home'),
    path('report/', home_page, name='report_list'),

    # DASHBOARD
    # Path ini harus sinkron dengan fetch('/api/dashboard/') di JavaScript dashboard kamu
    path('dashboard/', dashboard_page, name='dashboard'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),

    # LIVE SEARCH
    # Gunakan path 'search/' (dengan slash) agar cocok dengan fetch('/search/')
    path('search/', search_reports, name='search_reports'),

    # DETAIL & MODAL API
    # Detail halaman biasa
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    # API untuk Detail Modal (Pastikan dipanggil fetch('/api/report/ID/') di JS)
    path('api/report/<int:pk>/', report_detail_api, name='report_detail_api'),

    # CRUD ACTIONS (Admin Only)
    path('add/', ReportCreateView.as_view(), name='report_add'),
    path('edit/<int:pk>/', ReportUpdateView.as_view(), name='report_edit'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='report_delete'),
    path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='update_status'),
]