from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'location')