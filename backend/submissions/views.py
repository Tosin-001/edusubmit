from django.db.models import Avg, Count, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsLecturer, IsLecturerOrAdmin, IsStudent
from activitylogs.utils import log_action
from .models import Submission
from .serializers import (
    SubmissionCreateSerializer,
    SubmissionDetailSerializer,
    SubmissionListSerializer,
    SubmissionReviewSerializer,
)


# ---------- Student ----------

class SubmissionCreateView(generics.CreateAPIView):
    """POST /submissions/ — student uploads an assignment."""

    serializer_class = SubmissionCreateSerializer
    permission_classes = [IsStudent]

    def perform_create(self, serializer):
        submission = serializer.save()
        log_action(self.request.user, "submission.created", {"submission_id": submission.id})


class StudentSubmissionListView(generics.ListAPIView):
    """GET /students/me/submissions/ — own submissions, filterable by status/course."""

    serializer_class = SubmissionListSerializer
    permission_classes = [IsStudent]
    filterset_fields = ["status", "assignment__course"]
    search_fields = ["assignment__title", "assignment__course__course_code"]

    def get_queryset(self):
        return Submission.objects.filter(student=self.request.user).select_related(
            "assignment", "assignment__course"
        )


class SubmissionDetailView(generics.RetrieveAPIView):
    """
    GET /submissions/{id}/ — student sees own; lecturer sees own-course; admin sees all.
    Object-level access enforced in get_queryset (404 rather than 403 for non-owners,
    which avoids confirming a submission's existence to someone with no access to it).
    """

    serializer_class = SubmissionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related("assignment", "assignment__course", "student", "reviewed_by")
        if user.is_admin_role:
            return qs
        if user.is_lecturer:
            return qs.filter(assignment__course__lecturer=user)
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


# ---------- Lecturer ----------

class LecturerSubmissionListView(generics.ListAPIView):
    """GET /lecturers/me/submissions/ — submissions to the lecturer's own courses."""

    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsLecturer]
    filterset_fields = ["status", "assignment__course"]
    search_fields = ["student__full_name", "student__matric_number", "assignment__course__course_code"]

    def get_queryset(self):
        return Submission.objects.filter(assignment__course__lecturer=self.request.user).select_related(
            "assignment", "assignment__course", "student"
        )


class LecturerDashboardView(APIView):
    permission_classes = [IsLecturer]

    def get(self, request):
        qs = Submission.objects.filter(assignment__course__lecturer=request.user)
        return Response({
            "total_courses": request.user.courses_taught.count(),
            "total_assignments": request.user.assignments_created.count(),
            "pending_review": qs.filter(status__in=["submitted", "under_review"]).count(),
            "reviewed": qs.filter(status__in=["reviewed", "approved", "rejected"]).count(),
        })

import django.utils.timezone as tz


class SubmissionReviewView(generics.UpdateAPIView):
    """
    PATCH /submissions/{id}/review/
    Lecturer: only for submissions under their own course.
    Admin: any submission, including overriding a Lecturer's existing review
    (per project decision, 2026-07-14 — see PROJECT_STATUS.md).
    """

    serializer_class = SubmissionReviewSerializer
    permission_classes = [IsLecturerOrAdmin]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Submission.objects.select_related("assignment__course")

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        user = self.request.user
        if user.is_lecturer and obj.assignment.course.lecturer_id != user.id:
            raise PermissionDenied("You can only review submissions for your own courses.")
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
    Filter: ?status=, ?assignment__course=, ?assignment__lecturer=, ?student=
    Search: ?search= (student name/matric, course code)
    Date range: ?date_from=YYYY-MM-DD, ?date_to=YYYY-MM-DD
    """

    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["status", "assignment__course", "assignment__lecturer", "student"]
    search_fields = ["student__full_name", "student__matric_number", "assignment__course__course_code"]

    def get_queryset(self):
        qs = Submission.objects.select_related("assignment", "assignment__course", "student", "reviewed_by")
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
            "total_lecturers": User.objects.filter(role="lecturer").count(),
            "total_assignments": qs.values("assignment").distinct().count(),
            "pending_review": qs.filter(status__in=["submitted", "under_review"]).count(),
            "reviewed": qs.filter(status__in=["reviewed", "approved", "rejected"]).count(),
            "by_status": list(qs.values("status").annotate(count=Count("id"))),
        })


class SubmissionDownloadView(APIView):
    """GET /submissions/{id}/download/ — owner, course lecturer, or admin."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        submission = get_object_or_404(
            Submission.objects.select_related("assignment__course", "student"), pk=pk
        )
        user = request.user
        allowed = (
            user.is_admin_role
            or submission.student_id == user.id
            or (user.is_lecturer and submission.assignment.course.lecturer_id == user.id)
        )
        if not allowed:
            raise PermissionDenied("You do not have access to this file.")
        log_action(user, "submission.downloaded", {"submission_id": submission.id})
        return FileResponse(submission.file.open("rb"), as_attachment=True, filename=submission.file_name)
