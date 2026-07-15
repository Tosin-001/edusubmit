from django.contrib import admin

from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["course_code", "course_title", "lecturer", "semester"]
    list_filter = ["semester"]
    search_fields = ["course_code", "course_title"]
