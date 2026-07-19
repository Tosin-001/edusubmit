from django.contrib import admin

from .models import SchoolClass, Subject, TeacherAssignment


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "is_archived"]
    list_filter = ["is_archived"]
    search_fields = ["name", "code"]


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = ["name", "is_archived"]
    list_filter = ["is_archived"]
    search_fields = ["name"]


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ["teacher", "subject", "school_class"]
    list_filter = ["subject", "school_class"]
    search_fields = ["teacher__full_name", "subject__name", "school_class__name"]
