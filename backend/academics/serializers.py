from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.CharField(source="lecturer.full_name", read_only=True)

    class Meta:
        model = Course
        fields = ["id", "course_code", "course_title", "lecturer", "lecturer_name", "semester", "created_at"]
        read_only_fields = ["id", "created_at"]
