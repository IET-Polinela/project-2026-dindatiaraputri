from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularSwaggerView, 
    SpectacularRedocView
)

# Coba import Scalar, jika gagal gunakan Redoc sebagai alternatif
try:
    from drf_spectacular.views import SpectacularScalarView
    SCALAR_AVAILABLE = True
except ImportError:
    SpectacularScalarView = None
    SCALAR_AVAILABLE = False

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Aplikasi
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('dashboard/', include('dashboard_24782008.urls')),
    path('', include('usermanagement_24782008.urls')),
    
    # API
    path('api/', include('main_app.api_urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dokumentasi
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Tambahkan path Scalar hanya jika tersedia
if SCALAR_AVAILABLE:
    urlpatterns.append(
        path('api/docs/scalar/', SpectacularScalarView.as_view(url_name='schema'), name='scalar-ui')
    )