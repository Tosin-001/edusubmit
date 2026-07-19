from rest_framework import generics, permissions

from accounts.permissions import IsAdmin, IsTeacher
from activitylogs.utils import log_action
from .models import SchoolClass, Subject, TeacherAssignment
from .serializers import SchoolClassSerializer, SubjectSerializer, TeacherAssignmentSerializer


class SubjectListCreateView(generics.ListCreateAPIView):
    """Any authenticated user can list subjects. Only Admin can create/edit/archive."""

    serializer_class = SubjectSerializer
    search_fields = ["name", "code"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Subject.objects.all()
        archived = self.request.query_params.get("archived")
        if archived == "true":
            qs = qs.filter(is_archived=True)
        elif archived != "all":
            qs = qs.filter(is_archived=False)
        return qs

    def perform_create(self, serializer):
        subject = serializer.save()
        log_action(self.request.user, "subject.created", {"subject_id": subject.id, "name": subject.name})


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only edit/archive/delete. Read allowed to any authenticated user."""

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_update(self, serializer):
        was_archived = serializer.instance.is_archived
        subject = serializer.save()
        action = (
            "subject.archived" if subject.is_archived and not was_archived
            else "subject.restored" if was_archived and not subject.is_archived
            else "subject.updated"
        )
        log_action(self.request.user, action, {"subject_id": subject.id, "name": subject.name})

    def perform_destroy(self, instance):
        log_action(self.request.user, "subject.deleted", {"subject_id": instance.id, "name": instance.name})
        instance.delete()


class SchoolClassListCreateView(generics.ListCreateAPIView):
    """Any authenticated user can list classes. Only Admin can create/edit/archive."""

    serializer_class = SchoolClassSerializer
    search_fields = ["name"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = SchoolClass.objects.all()
        archived = self.request.query_params.get("archived")
        if archived == "true":
            qs = qs.filter(is_archived=True)
        elif archived != "all":
            qs = qs.filter(is_archived=False)
        return qs

    def perform_create(self, serializer):
        school_class = serializer.save()
        log_action(self.request.user, "class.created", {"class_id": school_class.id, "name": school_class.name})


class SchoolClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_update(self, serializer):
        was_archived = serializer.instance.is_archived
        school_class = serializer.save()
        action = (
            "class.archived" if school_class.is_archived and not was_archived
            else "class.restored" if was_archived and not school_class.is_archived
            else "class.updated"
        )
        log_action(self.request.user, action, {"class_id": school_class.id, "name": school_class.name})

    def perform_destroy(self, instance):
        log_action(self.request.user, "class.deleted", {"class_id": instance.id, "name": instance.name})
        instance.delete()


class TeacherAssignmentListCreateView(generics.ListCreateAPIView):
    """
    Admin-only write — teachers cannot assign themselves. Admin can list/filter
    all assignments; a Teacher can list their own via MyTeacherAssignmentsView.
    """

    queryset = TeacherAssignment.objects.select_related("teacher", "subject", "school_class").all()
    serializer_class = TeacherAssignmentSerializer
    filterset_fields = ["teacher", "subject", "school_class"]
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        ta = serializer.save()
        log_action(
            self.request.user,
            "teacher_assignment.created",
            {"teacher_assignment_id": ta.id, "teacher": ta.teacher.full_name, "subject": ta.subject.name, "class": ta.school_class.name},
        )


class TeacherAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherAssignment.objects.select_related("teacher", "subject", "school_class").all()
    serializer_class = TeacherAssignmentSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        ta = serializer.save()
        log_action(self.request.user, "teacher_assignment.updated", {"teacher_assignment_id": ta.id})

    def perform_destroy(self, instance):
        log_action(self.request.user, "teacher_assignment.deleted", {"teacher_assignment_id": instance.id})
        instance.delete()


class MyTeacherAssignmentsView(generics.ListAPIView):
    """GET /teachers/me/assignments-taught/ — the logged-in teacher's own Subject x Class assignments."""

    serializer_class = TeacherAssignmentSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return TeacherAssignment.objects.filter(teacher=self.request.user).select_related("subject", "school_class")
