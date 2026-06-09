from rest_framework.routers import DefaultRouter
from .api_views import ReportViewSet

router = DefaultRouter()

# FIX: Ubah 'report' menjadi 'reports' agar sesuai dengan fetch di app.js
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = router.urls