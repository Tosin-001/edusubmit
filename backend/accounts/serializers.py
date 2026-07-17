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


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """
    Admin-only: create a Student, Lecturer, or Admin account directly (no
    public signup for lecturer/admin; this also gives Admin a way to create
    a student without the student self-registering).
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "full_name", "matric_number", "staff_id", "email", "department", "role", "password"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        role = attrs.get("role")
        if role == User.Role.STUDENT and not attrs.get("matric_number"):
            raise serializers.ValidationError({"matric_number": "Required for student accounts."})
        if role in (User.Role.LECTURER, User.Role.ADMIN) and not attrs.get("staff_id"):
            raise serializers.ValidationError({"staff_id": "Required for lecturer/admin accounts."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# Backward-compatible alias — some code/tests may still import the old name.
AdminCreateStaffSerializer = AdminCreateUserSerializer


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class AdminResetPasswordSerializer(serializers.Serializer):
    """
    Admin-only: reset another user's password. If new_password is omitted,
    the view generates a random one and returns it in the response so the
    admin can hand it to the user out-of-band.
    """

    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
