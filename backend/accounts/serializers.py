from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["full_name", "matric_number", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(role=User.Role.STUDENT, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "role", "full_name", "email", "matric_number",
            "staff_id", "department", "is_active", "created_at",
        ]
        read_only_fields = ["id", "role", "created_at"]


class AdminCreateStaffSerializer(serializers.ModelSerializer):
    """Admin-only: create Lecturer or Admin accounts (no public signup for these roles)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["full_name", "staff_id", "email", "department", "role", "password"]

    def validate_role(self, value):
        if value not in (User.Role.LECTURER, User.Role.ADMIN):
            raise serializers.ValidationError("Role must be lecturer or admin.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
