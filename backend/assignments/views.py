from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsTeacherOrAdmin
from activitylogs.utils import log_action
from .models import Assignment
from .serializers import AssignmentCreateSerializer, AssignmentSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    """
    Read: role-scoped —
      * Teacher sees only assignments under their own TeacherAssignments
      * Student sees only assignments for their own school_class (none if
        no class assigned yet — per spec, students must never see other
        classes' assignments, including pre-pivot assignments with no class)
      * Admin sees everything
    Write: Teacher (creates under one of their own TeacherAssignments, no
    subject/class picker — see AssignmentCreateSerializer) or Admin.
    Archived hidden by default; ?archived=true / ?archived=all to see them.
    """

    filterset_fields = ["teacher_assignment", "course", "lecturer"]
    search_fields = ["title", "teacher_assignment__subject__name", "course__code", "course__name"]

    def get_serializer_class(self):
        return AssignmentCreateSerializer if self.request.method == "POST" else AssignmentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Assignment.objects.select_related(
            "teacher_assignment__subject", "teacher_assignment__school_class", "course", "lecturer"
        )
        user = self.request.user
        if user.is_teacher:
            qs = qs.filter(teacher_assignment__teacher=user)
        elif user.is_student:
            if not user.school_class_id:
                qs = qs.none()
            else:
                qs = qs.filter(teacher_assignment__school_class_id=user.school_class_id)
        # admin: no extra filtering, sees everything including pre-pivot data

        archived = self.request.query_params.get("archived")
        if archived == "true":
            qs = qs.filter(is_archived=True)
        elif archived != "all":
            qs = qs.filter(is_archived=False)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        teacher_assignment = serializer.validated_data["teacher_assignment"]
        if user.is_teacher and teacher_assignment.teacher_id != user.id:
            raise PermissionDenied("You can only create assignments under your own Subject/Class assignments.")
        assignment = serializer.save()
        log_action(
            user, "assignment.created",
            {
                "assignment_id": assignment.id, "title": assignment.title,
                "subject": teacher_assignment.subject.name, "class": teacher_assignment.school_class.name,
            },
        )


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: role-scoped same as the list view (students/teachers only see what
    they're allowed to; this also avoids leaking another class's assignment
    via a guessed ID — returns 404, not 403, for anything outside scope).
    PATCH: Teacher (own TeacherAssignment)/Admin — this is also how
    archiving works (PATCH {"is_archived": true}), which the frontend uses
    instead of DELETE for "Delete", since deleting an assignment cascades
    and deletes every student's submission to it. DELETE still exists
    (Admin data-cleanup escape hatch) but the Teacher UI never calls it.
    """

    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsTeacherOrAdmin()]

    def get_queryset(self):
        qs = Assignment.objects.select_related(
            "teacher_assignment__subject", "teacher_assignment__school_class", "course", "lecturer"
        )
        user = self.request.user
        if user.is_teacher:
            return qs.filter(teacher_assignment__teacher=user)
        if user.is_student:
            if not user.school_class_id:
                return qs.none()
            return qs.filter(teacher_assignment__school_class_id=user.school_class_id)
        return qs  # admin

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
