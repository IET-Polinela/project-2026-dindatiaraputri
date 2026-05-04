from django.urls import path
from .views import dashboard_page, dashboard_data

urlpatterns = [
    path('dashboard/', dashboard_page, name='dashboard'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),
]