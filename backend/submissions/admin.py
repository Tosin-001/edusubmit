from django.contrib import admin

from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ["student", "assignment", "status", "grade", "submitted_at"]
    list_filter = ["status"]
    search_fields = ["student__full_name", "student__matric_number", "assignment__title"]
    readonly_fields = ["file_name", "file_size_kb", "submitted_at"]
