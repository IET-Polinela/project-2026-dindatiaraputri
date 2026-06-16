from rest_framework.routers import DefaultRouter
from django.urls import path

from .api_views import RegisterView, ReportViewSet, WhoAmI

router = DefaultRouter()

# FIX: Ubah 'report' menjadi 'reports' agar sesuai dengan fetch di app.js
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api_register'),
    path('whoami/', WhoAmI.as_view(), name='api_whoami'),
]

urlpatterns += router.urls
