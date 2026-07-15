from django.urls import path

from academics.views import CourseListCreateView, CourseDetailView
from activitylogs.views import ActivityLogListView
from submissions.views import AdminDashboardView, AdminSubmissionListView, AdminSubmissionDeleteView
from .views import AdminUserDetailView, AdminUserListCreateView

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUserListCreateView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("courses/", CourseListCreateView.as_view(), name="admin-courses"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="admin-course-detail"),
    path("submissions/", AdminSubmissionListView.as_view(), name="admin-submissions"),
    path("submissions/<int:pk>/", AdminSubmissionDeleteView.as_view(), name="admin-submission-delete"),
    path("activity-logs/", ActivityLogListView.as_view(), name="admin-activity-logs"),
]
