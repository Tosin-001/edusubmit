from django.urls import path

from academics.views import MyCoursesView
from assignments.views import AssignmentListCreateView
from submissions.views import LecturerDashboardView, LecturerSubmissionListView
from .views import MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="lecturer-me"),
    path("me/dashboard/", LecturerDashboardView.as_view(), name="lecturer-dashboard"),
    path("me/courses/", MyCoursesView.as_view(), name="lecturer-courses"),
    path("me/assignments/", AssignmentListCreateView.as_view(), name="lecturer-assignments"),
    path("me/submissions/", LecturerSubmissionListView.as_view(), name="lecturer-submissions"),
]
