from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string

from activitylogs.utils import log_action
from .models import User
from .permissions import IsAdmin
from .serializers import (
    AdminCreateUserSerializer,
    AdminResetPasswordSerializer,
    ChangePasswordSerializer,
    StudentRegisterSerializer,
    UserSerializer,
)


class StudentRegisterView(generics.CreateAPIView):
    serializer_class = StudentRegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(user, "auth.student_registered")


class LogoutView(APIView):
    """Blacklists the refresh token to invalidate the session."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid or missing refresh token."}, status=400)
        log_action(request.user, "auth.logout")
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"old_password": "Incorrect password."}, status=400)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        log_action(user, "auth.password_changed")
        return Response({"detail": "Password updated."})


class MeView(generics.RetrieveAPIView):
    """
    GET the logged-in user's own profile — used by all 3 roles.
    Read-only by design: name/email/matric or staff ID/department are
    Admin-assigned academic/identity details. Students and Lecturers cannot
    edit their own profile (they previously could via PATCH here — that was
    an unintended permission gap, closed 2026-07-18). Only Admin can change
    these fields, via AdminUserDetailView. Password changes are unaffected
    (separate ChangePasswordView, not a profile-editing concern).
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListCreateView(generics.ListCreateAPIView):
    """Admin: list/search all users, or create a Student/Lecturer/Admin account directly."""

    queryset = User.objects.all()
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active", "department"]
    search_fields = ["full_name", "email", "matric_number", "staff_id"]

    def get_serializer_class(self):
        return AdminCreateUserSerializer if self.request.method == "POST" else UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(
            self.request.user,
            "admin.user_created",
            {"target_user_id": user.id, "role": user.role, "full_name": user.full_name},
        )


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: view/edit/deactivate/delete a specific user."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        was_active = serializer.instance.is_active
        user = serializer.save()
        if was_active and not user.is_active:
            action = "admin.user_deactivated"
        elif user.is_active and not was_active:
            action = "admin.user_activated"
        else:
            action = "admin.user_updated"
        log_action(self.request.user, action, {"target_user_id": user.id})

    def perform_destroy(self, instance):
        log_action(self.request.user, "admin.user_deleted", {"target_user_id": instance.id})
        instance.delete()


class AdminResetPasswordView(APIView):
    """
    POST /admin/users/{id}/reset-password/
    Admin-only. Accepts an optional {"new_password": "..."}; if omitted, a
    random password is generated and returned in the response for the admin
    to relay to the user.
    """

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)

        serializer = AdminResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data.get("new_password")
        generated = False
        if not new_password:
            new_password = get_random_string(16)
            generated = True

        user.set_password(new_password)
        user.save()
        log_action(request.user, "admin.password_reset", {"target_user_id": user.id})

        response = {"detail": "Password reset."}
        if generated:
            response["generated_password"] = new_password
        return Response(response)
