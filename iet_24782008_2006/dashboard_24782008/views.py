from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count
from main_app.models import Report


def dashboard_page(request):
    return render(request, 'dashboard_24782008/dashboard.html')


def dashboard_data(request):
    status_data = Report.objects.values('status').annotate(total=Count('id'))
    category_data = Report.objects.values('category').annotate(total=Count('id'))

    reported = Report.objects.filter(status='REPORTED').order_by('-id')[:5]
    resolved = Report.objects.filter(status='RESOLVED').order_by('-id')[:5]

    return JsonResponse({
        "status": list(status_data),
        "category": list(category_data),
        "reported": list(reported.values('title', 'category', 'status')),
        "resolved": list(resolved.values('title', 'category', 'status')),
    })

# Create your views here.
