from django.shortcuts import render
from django.http import JsonResponse
from main_app.models import Report
from django.db.models import Count


def dashboard_page(request):
    return render(request, 'dashboard_24782008/dashboard.html')


def dashboard_data(request):
    # Distribusi Status
    status_data = Report.objects.values('status').annotate(total=Count('id'))

    # Distribusi Kategori
    category_data = Report.objects.values('category').annotate(total=Count('id'))

    # 5 laporan terbaru REPORTED
    reported = Report.objects.filter(status='REPORTED').order_by('-id')[:5]

    # 5 laporan terbaru RESOLVED
    resolved = Report.objects.filter(status='RESOLVED').order_by('-id')[:5]

    data = {
        "status": list(status_data),
        "category": list(category_data),
        "reported": list(reported.values('title', 'category', 'status')),
        "resolved": list(resolved.values('title', 'category', 'status')),
    }

    return JsonResponse(data)