from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsLecturerOrAdmin
from activitylogs.utils import log_action
from .models import Assignment
from .serializers import AssignmentSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    """
    Read: any authenticated user (students need this to pick an assignment to
    submit against). Write: Lecturer (own course only) or Admin.
    """

    serializer_class = AssignmentSerializer
    filterset_fields = ["course", "lecturer"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLecturerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Assignment.objects.select_related("course", "lecturer")
        user = self.request.user
        if user.is_lecturer:
            return qs.filter(course__lecturer=user)
        return qs  # students and admin see all

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]
        if user.is_lecturer and course.lecturer_id != user.id:
            raise PermissionDenied("You can only create assignments for courses assigned to you.")
        assignment = serializer.save(lecturer=course.lecturer or user)
        log_action(user, "assignment.created", {"assignment_id": assignment.id})


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsLecturerOrAdmin()]

    def get_queryset(self):
        qs = Assignment.objects.select_related("course", "lecturer")
        user = self.request.user
        if self.request.method != "GET" and user.is_lecturer:
            return qs.filter(course__lecturer=user)
        return qs

    def perform_update(self, serializer):
        assignment = serializer.save()
        log_action(self.request.user, "assignment.updated", {"assignment_id": assignment.id})

    def perform_destroy(self, instance):
        log_action(self.request.user, "assignment.deleted", {"assignment_id": instance.id})
        instance.delete()
