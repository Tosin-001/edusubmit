from django.utils import timezone
from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    # New (secondary-school pivot) — derived from teacher_assignment, null-safe
    # since pre-pivot assignments have no TeacherAssignment.
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    # Deprecated — kept working for the not-yet-rewired views/frontend.
    # "course" here is a Subject (renamed 2026-07-19); course_code now reads
    # Subject.code (was course_code before the rename).
    course_code = serializers.CharField(source="course.code", read_only=True, default=None)
    submission_count = serializers.IntegerField(source="submissions.count", read_only=True)
    is_past_due = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id", "teacher_assignment", "subject_name", "class_name",
            "course", "course_code", "lecturer", "title", "description",
            "due_date", "max_score", "allowed_file_types", "max_file_size_mb",
            "is_archived", "is_past_due", "submission_count", "created_at",
        ]
        read_only_fields = ["id", "lecturer", "created_at"]

    def get_subject_name(self, obj):
        return obj.teacher_assignment.subject.name if obj.teacher_assignment else None

    def get_class_name(self, obj):
        return obj.teacher_assignment.school_class.name if obj.teacher_assignment else None

    def get_is_past_due(self, obj):
        return bool(obj.due_date and obj.due_date < timezone.now())
