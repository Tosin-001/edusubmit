from rest_framework import generics, permissions

from accounts.permissions import IsAdmin, IsLecturer
from activitylogs.utils import log_action
from .models import Course
from .serializers import CourseSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    """
    Any authenticated user can list courses (for dropdowns).
    Only Admin can create — courses are Admin-assigned, not Lecturer-created.
    """

    queryset = Course.objects.select_related("lecturer").all()
    serializer_class = CourseSerializer
    filterset_fields = ["lecturer", "semester"]
    search_fields = ["course_code", "course_title"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.save()
        log_action(self.request.user, "course.created", {"course_id": course.id})

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only edit/reassign-lecturer/delete. Read allowed to any authenticated user."""

    queryset = Course.objects.select_related("lecturer").all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_update(self, serializer):
        course = serializer.save()
        log_action(self.request.user, "course.updated", {"course_id": course.id})

    def perform_destroy(self, instance):
        log_action(self.request.user, "course.deleted", {"course_id": instance.id})
        instance.delete()


class MyCoursesView(generics.ListAPIView):
    """GET /lecturers/me/courses/ — the lecturer's own assigned courses only."""

    serializer_class = CourseSerializer
    permission_classes = [IsLecturer]

    def get_queryset(self):
        return Course.objects.filter(lecturer=self.request.user)
