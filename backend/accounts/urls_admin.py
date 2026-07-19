from django.urls import path

from academics.views import (
    SchoolClassDetailView,
    SchoolClassListCreateView,
    SubjectDetailView,
    SubjectListCreateView,
    TeacherAssignmentDetailView,
    TeacherAssignmentListCreateView,
)
from activitylogs.views import ActivityLogListView
from submissions.views import AdminDashboardView, AdminSubmissionListView, AdminSubmissionDeleteView
from .views import AdminResetPasswordView, AdminUserDetailView, AdminUserListCreateView

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUserListCreateView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<int:pk>/reset-password/", AdminResetPasswordView.as_view(), name="admin-user-reset-password"),
    path("subjects/", SubjectListCreateView.as_view(), name="admin-subjects"),
    path("subjects/<int:pk>/", SubjectDetailView.as_view(), name="admin-subject-detail"),
    path("classes/", SchoolClassListCreateView.as_view(), name="admin-classes"),
    path("classes/<int:pk>/", SchoolClassDetailView.as_view(), name="admin-class-detail"),
    path("teacher-assignments/", TeacherAssignmentListCreateView.as_view(), name="admin-teacher-assignments"),
    path("teacher-assignments/<int:pk>/", TeacherAssignmentDetailView.as_view(), name="admin-teacher-assignment-detail"),
    path("submissions/", AdminSubmissionListView.as_view(), name="admin-submissions"),
    path("submissions/<int:pk>/", AdminSubmissionDeleteView.as_view(), name="admin-submission-delete"),
    path("activity-logs/", ActivityLogListView.as_view(), name="admin-activity-logs"),
]
