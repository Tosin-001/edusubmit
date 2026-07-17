from django.utils import timezone
from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    submission_count = serializers.IntegerField(source="submissions.count", read_only=True)
    is_past_due = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_code", "lecturer", "title", "description",
            "due_date", "max_score", "allowed_file_types", "max_file_size_mb",
            "is_archived", "is_past_due", "submission_count", "created_at",
        ]
        read_only_fields = ["id", "lecturer", "created_at"]

    def get_is_past_due(self, obj):
        return bool(obj.due_date and obj.due_date < timezone.now())
