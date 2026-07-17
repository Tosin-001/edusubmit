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
    Archived assignments are hidden by default; pass ?archived=true to see
    only archived ones, or ?archived=all to see everything.
    """

    serializer_class = AssignmentSerializer
    filterset_fields = ["course", "lecturer"]
    search_fields = ["title", "course__course_code", "course__course_title"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLecturerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Assignment.objects.select_related("course", "lecturer")
        user = self.request.user
        if user.is_lecturer:
            qs = qs.filter(course__lecturer=user)

        archived = self.request.query_params.get("archived")
        if archived == "true":
            qs = qs.filter(is_archived=True)
        elif archived != "all":
            qs = qs.filter(is_archived=False)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]
        if user.is_lecturer and course.lecturer_id != user.id:
            raise PermissionDenied("You can only create assignments for courses assigned to you.")
        assignment = serializer.save(lecturer=course.lecturer or user)
        log_action(user, "assignment.created", {"assignment_id": assignment.id, "title": assignment.title})


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: any authenticated user. PATCH: Lecturer(own course)/Admin — this is
    also how archiving works (PATCH {"is_archived": true}), which the
    frontend uses instead of DELETE for the "Delete" action, since deleting
    an assignment cascades and deletes every student's submission to it.
    DELETE is still exposed (Admin data-cleanup escape hatch) but the
    Lecturer UI never calls it.
    """

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
        was_archived = serializer.instance.is_archived
        assignment = serializer.save()
        if assignment.is_archived and not was_archived:
            action = "assignment.archived"
        elif was_archived and not assignment.is_archived:
            action = "assignment.restored"
        else:
            action = "assignment.updated"
        log_action(self.request.user, action, {"assignment_id": assignment.id, "title": assignment.title})

    def perform_destroy(self, instance):
        log_action(self.request.user, "assignment.deleted", {"assignment_id": instance.id, "title": instance.title})
        instance.delete()
