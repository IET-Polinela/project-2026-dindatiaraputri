from django.urls import path
from .views import dashboard_page, dashboard_data

urlpatterns = [
    path('dashboard/', dashboard_page, name='dashboard_24782008_home'),
    path('api/dashboard/', dashboard_data, name='dashboard_24782008_data'),
]