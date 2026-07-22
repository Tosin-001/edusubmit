from django.db.models import Avg, Count, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsTeacher, IsTeacherOrAdmin, IsStudent
from activitylogs.utils import log_action
from .models import Submission
from .serializers import (
    SubmissionCreateSerializer,
    SubmissionDetailSerializer,
    SubmissionListSerializer,
    SubmissionReviewSerializer,
)


def _is_owning_teacher(user, assignment):
    """
    True if `user` is the teacher for this assignment, checking both the new
    TeacherAssignment path and the deprecated course.lecturer path (so
    pre-pivot assignments a teacher created are still reviewable by them).
    """
    if assignment.teacher_assignment_id and assignment.teacher_assignment.teacher_id == user.id:
        return True
    if assignment.course_id and assignment.course.lecturer_id == user.id:
        return True
    return False


# ---------- Student ----------

class SubmissionCreateView(generics.CreateAPIView):
    """POST /submissions/ — student uploads an assignment."""

    serializer_class = SubmissionCreateSerializer
    permission_classes = [IsStudent]

    def perform_create(self, serializer):
        submission = serializer.save()
        log_action(self.request.user, "submission.created", {"submission_id": submission.id})


class StudentSubmissionListView(generics.ListAPIView):
    """GET /students/me/submissions/ — own submissions, filterable by status/subject."""

    serializer_class = SubmissionListSerializer
    permission_classes = [IsStudent]
    filterset_fields = ["status", "assignment__course", "assignment__teacher_assignment"]
    search_fields = ["assignment__title", "assignment__course__code", "assignment__course__name"]

    def get_queryset(self):
        return Submission.objects.filter(student=self.request.user).select_related(
            "assignment", "assignment__course", "assignment__teacher_assignment__subject",
            "assignment__teacher_assignment__school_class",
        )


class SubmissionDetailView(generics.RetrieveAPIView):
    """
    GET /submissions/{id}/ — student sees own; teacher sees own subject/class
    (or deprecated own-course); admin sees all. Object-level access enforced
    in get_queryset (404 rather than 403 for non-owners, which avoids
    confirming a submission's existence to someone with no access to it).
    """

    serializer_class = SubmissionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related(
            "assignment", "assignment__course", "assignment__teacher_assignment", "student", "reviewed_by"
        )
        if user.is_admin_role:
            return qs
        if user.is_teacher:
            return qs.filter(
                Q(assignment__teacher_assignment__teacher=user) | Q(assignment__course__lecturer=user)
            )
        return qs.filter(student=user)


class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        qs = Submission.objects.filter(student=request.user)
        avg_grade = qs.exclude(grade=None).aggregate(avg=Avg("grade"))["avg"]
        return Response({
            "total_submissions": qs.count(),
            "pending_review": qs.filter(status__in=["submitted", "under_review"]).count(),
            "approved": qs.filter(status="approved").count(),
            "average_grade": round(avg_grade, 1) if avg_grade is not None else None,
        })


# ---------- Teacher ----------

class TeacherSubmissionListView(generics.ListAPIView):
    """GET /teachers/me/submissions/ — submissions to the teacher's own Subject x Class assignments."""

    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ["status", "assignment__teacher_assignment", "assignment__course"]
    search_fields = ["student__full_name", "student__matric_number", "assignment__teacher_assignment__subject__name"]

    def get_queryset(self):
        user = self.request.user
        return Submission.objects.filter(
            Q(assignment__teacher_assignment__teacher=user) | Q(assignment__course__lecturer=user)
        ).select_related("assignment", "assignment__teacher_assignment", "assignment__course", "student")


class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        user = request.user
        qs = Submission.objects.filter(
            Q(assignment__teacher_assignment__teacher=user) | Q(assignment__course__lecturer=user)
        )
        return Response({
            "total_assignments_taught": user.teaching_assignments.count(),
            "total_assignments": user.assignments_created.count() + user.teaching_assignments.aggregate(
                n=Count("assignments")
            )["n"],
            "pending_review": qs.filter(status__in=["submitted", "under_review"]).count(),
            "reviewed": qs.filter(status__in=["reviewed", "approved", "rejected"]).count(),
        })


import django.utils.timezone as tz


class SubmissionReviewView(generics.UpdateAPIView):
    """
    PATCH /submissions/{id}/review/
    Teacher: only for submissions under their own Subject/Class assignment
    (or deprecated own-course assignment). Admin: any submission, including
    overriding a Teacher's existing review (per project decision — see
    PROJECT_STATUS.md).
    """

    serializer_class = SubmissionReviewSerializer
    permission_classes = [IsTeacherOrAdmin]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Submission.objects.select_related("assignment__course", "assignment__teacher_assignment")

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        user = self.request.user
        if user.is_teacher and not _is_owning_teacher(user, obj.assignment):
            raise PermissionDenied("You can only review submissions for your own Subject/Class assignments.")
        return obj

    def perform_update(self, serializer):
        instance = self.get_object()
        is_override = instance.reviewed_by_id is not None and self.request.user.is_admin_role \
            and instance.reviewed_by_id != self.request.user.id
        submission = serializer.save(reviewed_by=self.request.user, reviewed_at=tz.now())
        log_action(
            self.request.user,
            "submission.review_overridden" if is_override else "submission.reviewed",
            {"submission_id": submission.id, "status": submission.status, "grade": submission.grade},
        )


# ---------- Admin ----------

class AdminSubmissionListView(generics.ListAPIView):
    """
    GET /admin/submissions/ — all submissions.
    Filter: ?status=, ?assignment__course=, ?assignment__teacher_assignment=,
            ?assignment__teacher_assignment__teacher=, ?student=
    Search: ?search= (student name/matric, subject name/code)
    Date range: ?date_from=YYYY-MM-DD, ?date_to=YYYY-MM-DD
    """

    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsAdmin]
    filterset_fields = [
        "status", "assignment__course", "assignment__teacher_assignment",
        "assignment__teacher_assignment__teacher", "assignment__teacher_assignment__subject", "student",
    ]
    search_fields = ["student__full_name", "student__matric_number", "assignment__teacher_assignment__subject__name"]

    def get_queryset(self):
        qs = Submission.objects.select_related(
            "assignment", "assignment__course", "assignment__teacher_assignment", "student", "reviewed_by"
        )
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(submitted_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(submitted_at__date__lte=date_to)
        return qs


class AdminSubmissionDeleteView(generics.DestroyAPIView):
    queryset = Submission.objects.all()
    permission_classes = [IsAdmin]

    def perform_destroy(self, instance):
        log_action(self.request.user, "submission.deleted", {"submission_id": instance.id})
        instance.delete()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from accounts.models import User
        qs = Submission.objects.all()
        return Response({
            "total_students": User.objects.filter(role="student").count(),
            "total_teachers": User.objects.filter(role="teacher").count(),
            "total_assignments": qs.values("assignment").distinct().count(),
            "pending_review": qs.filter(status__in=["submitted", "under_review"]).count(),
            "reviewed": qs.filter(status__in=["reviewed", "approved", "rejected"]).count(),
            "by_status": list(qs.values("status").annotate(count=Count("id"))),
        })


class SubmissionDownloadView(APIView):
    """GET /submissions/{id}/download/ — owner, owning teacher, or admin."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        submission = get_object_or_404(
            Submission.objects.select_related("assignment__course", "assignment__teacher_assignment", "student"),
            pk=pk,
        )
        user = request.user
        allowed = (
            user.is_admin_role
            or submission.student_id == user.id
            or (user.is_teacher and _is_owning_teacher(user, submission.assignment))
        )
        if not allowed:
            raise PermissionDenied("You do not have access to this file.")
        log_action(user, "submission.downloaded", {"submission_id": submission.id})
        return FileResponse(submission.file.open("rb"), as_attachment=True, filename=submission.file_name)
