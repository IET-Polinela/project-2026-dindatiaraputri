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
    # --- HOME & LANDING PAGE ---
    # home_page digunakan di kedua path agar fitur pencarian tetap sinkron
    path('', home_page, name='home'),
    path('report/', home_page, name='report_list'),

    # --- DASHBOARD AREA ---
    # Halaman utama dashboard dan endpoint API untuk datanya
    path('dashboard/', dashboard_page, name='dashboard'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),

    # --- SEARCH & MODAL API ---
    # Endpoint untuk live search dan detail modal tanpa reload
    path('search/', search_reports, name='search_reports'),
    path('api/report/<int:pk>/', report_detail_api, name='report_detail_api'),

    # --- REPORT DETAILS PAGE ---
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),

    # --- CRUD OPERATIONS (Admin/Petugas) ---
    path('add/', ReportCreateView.as_view(), name='report_add'),
    path('edit/<int:pk>/', ReportUpdateView.as_view(), name='report_edit'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='report_delete'),
    path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='update_status'),
]