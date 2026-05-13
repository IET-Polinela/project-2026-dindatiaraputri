from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

urlpatterns = [
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

    # Authentication
    path('login/', auth_views.LoginView.as_view(
        template_name='usermanagement_24782008/login.html'
    ), name='login'),

    path('logout/', auth_views.LogoutView.as_view(
        next_page='login'
    ), name='logout'),
]