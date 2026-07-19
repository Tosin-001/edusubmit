from django.urls import path

from .views import (
    SchoolClassDetailView,
    SchoolClassListCreateView,
    SubjectDetailView,
    SubjectListCreateView,
    TeacherAssignmentDetailView,
    TeacherAssignmentListCreateView,
)

urlpatterns = [
    path("subjects/", SubjectListCreateView.as_view(), name="subject-list"),
    path("subjects/<int:pk>/", SubjectDetailView.as_view(), name="subject-detail"),
    path("classes/", SchoolClassListCreateView.as_view(), name="class-list"),
    path("classes/<int:pk>/", SchoolClassDetailView.as_view(), name="class-detail"),
    path("teacher-assignments/", TeacherAssignmentListCreateView.as_view(), name="teacher-assignment-list"),
    path("teacher-assignments/<int:pk>/", TeacherAssignmentDetailView.as_view(), name="teacher-assignment-detail"),
]
