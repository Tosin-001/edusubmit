from rest_framework import serializers

from .models import Submission


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["id", "assignment", "file"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["student"] = self.context["request"].user
        return super().create(validated_data)


class SubmissionListSerializer(serializers.ModelSerializer):
    """Used for student's own submission table."""

    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    course_code = serializers.CharField(source="assignment.course.course_code", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment_title", "course_code", "status", "grade",
            "feedback", "file_name", "submitted_at", "reviewed_at",
        ]


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Full detail view — used by lecturer/admin review screens and student detail view."""

    student_name = serializers.CharField(source="student.full_name", read_only=True)
    matric_number = serializers.CharField(source="student.matric_number", read_only=True)
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    course_code = serializers.CharField(source="assignment.course.course_code", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "assignment_title", "course_code", "student",
            "student_name", "matric_number", "file", "file_name", "file_size_kb",
            "status", "grade", "feedback", "review_notes", "reviewed_by",
            "reviewed_by_name", "submitted_at", "reviewed_at",
        ]
        read_only_fields = [f for f in fields if f not in ("status", "grade", "feedback", "review_notes")]


class SubmissionReviewSerializer(serializers.ModelSerializer):
    """Used by Lecturer (own course) and Admin (any, override allowed) to grade a submission."""

    class Meta:
        model = Submission
        fields = ["status", "grade", "feedback", "review_notes"]
