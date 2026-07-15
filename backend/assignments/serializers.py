from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_code", "lecturer", "title", "description",
            "due_date", "max_score", "allowed_file_types", "max_file_size_mb", "created_at",
        ]
        read_only_fields = ["id", "lecturer", "created_at"]
