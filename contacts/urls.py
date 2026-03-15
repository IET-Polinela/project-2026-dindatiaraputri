from django.urls import path
from . import views # Ini mengimpor isi dari views.py

urlpatterns = [
    path('', views.about_page, name='about'), # Ini menghubungkan URL ke fungsi di views.py
]