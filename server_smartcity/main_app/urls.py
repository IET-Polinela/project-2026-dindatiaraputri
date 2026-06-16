from django.urls import path
from rest_framework.routers import DefaultRouter

# =========================
# IMPORT HTML VIEW
# =========================
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
    home_page,
)

# =========================
# IMPORT API VIEW
# =========================
from .api_views import (
    ReportViewSet,
    RegisterView,
    WhoAmI
)

# =========================
# DRF ROUTER
# =========================
router = DefaultRouter()

router.register(
    r'api/report',
    ReportViewSet,
    basename='report'
)

# =========================
# URL PATTERNS
# =========================
urlpatterns = [

    # HOME
    path('', home_page, name='home'),
    path('report/', home_page, name='report_list'),

    # DASHBOARD
    path('dashboard/', dashboard_page, name='dashboard'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),

    # SEARCH
    path('search/', search_reports, name='search_reports'),

    # DETAIL
    path(
        'report/<int:pk>/',
        ReportDetailView.as_view(),
        name='report_detail'
    ),

    # CRUD HTML
    path('add/', ReportCreateView.as_view(), name='report_add'),
    path('edit/<int:pk>/', ReportUpdateView.as_view(), name='report_edit'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='report_delete'),
    path(
        'update-status/<int:pk>/',
        ReportUpdateStatusView.as_view(),
        name='update_status'
    ),

    # REGISTER API
    path(
        'api/register/',
        RegisterView.as_view(),
        name='register'
    ),
    # WHO AM I (frontend uses this to detect role)
    path('api/whoami/', WhoAmI.as_view(), name='whoami'),
]

# =========================
# ROUTER URLS
# =========================
urlpatterns += router.urls