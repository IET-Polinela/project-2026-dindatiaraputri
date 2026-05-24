from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

# Import JWT Views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Main App
    path('', include('main_app.urls')),

    # About & Contacts
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),

    # Dashboard
    path('dashboard/', include('dashboard_24782008.urls')),

    # DRF API
    path('api/', include('main_app.api_urls')),

    path('api-auth/', include('rest_framework.urls')),

    # Authentication
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='usermanagement_24782008/login.html'
        ),
        name='login'
    ),

    path(
        'logout/',
        auth_views.LogoutView.as_view(
            next_page='login'
        ),
        name='logout'
    ),

    # JWT Authentication API
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
]