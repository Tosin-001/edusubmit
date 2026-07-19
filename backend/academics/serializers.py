from rest_framework import serializers

from .models import SchoolClass, Subject, TeacherAssignment


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "is_archived", "created_at"]
        read_only_fields = ["id", "created_at"]


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ["id", "name", "is_archived", "created_at"]
        read_only_fields = ["id", "created_at"]


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class_name = serializers.CharField(source="school_class.name", read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            "id", "teacher", "teacher_name", "subject", "subject_name",
            "school_class", "class_name", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
