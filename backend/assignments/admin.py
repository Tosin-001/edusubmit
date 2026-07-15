from django.contrib import admin

from .models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "lecturer", "due_date", "max_score"]
    list_filter = ["course"]
    search_fields = ["title", "course__course_code"]
