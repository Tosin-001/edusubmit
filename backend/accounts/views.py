from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from activitylogs.utils import log_action
from .models import User
from .permissions import IsAdmin
from .serializers import (
    AdminCreateStaffSerializer,
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


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the logged-in user's own profile — used by all 3 roles."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListCreateView(generics.ListCreateAPIView):
    """Admin: list/search all users, or create a Lecturer/Admin account."""

    queryset = User.objects.all()
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active", "department"]
    search_fields = ["full_name", "email", "matric_number", "staff_id"]

    def get_serializer_class(self):
        return AdminCreateStaffSerializer if self.request.method == "POST" else UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(self.request.user, "admin.staff_created", {"target_user_id": user.id})


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: view/edit/deactivate/delete a specific user."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        user = serializer.save()
        log_action(self.request.user, "admin.user_updated", {"target_user_id": user.id})

    def perform_destroy(self, instance):
        log_action(self.request.user, "admin.user_deleted", {"target_user_id": instance.id})
        instance.delete()
