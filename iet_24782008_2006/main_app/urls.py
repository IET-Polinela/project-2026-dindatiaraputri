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
    report_detail_api
)

urlpatterns = [
    # 📄 CRUD REPORT
    path('', ReportListView.as_view(), name='report_list'),
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('add/', ReportCreateView.as_view(), name='report_add'),
    path('edit/<int:pk>/', ReportUpdateView.as_view(), name='report_edit'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='report_delete'),

    # 🔄 UPDATE STATUS
    path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='update_status'),

    # 📊 DASHBOARD
    path('dashboard/', dashboard_page, name='dashboard'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),

    # 🔍 LIVE SEARCH (🔥 FIX DI SINI)
    path('search/', search_reports, name='search_reports'),

    # 📄 DETAIL MODAL
    path('api/report/<int:pk>/', report_detail_api, name='report_detail_api'),
]