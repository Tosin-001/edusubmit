from django.urls import path

from submissions.views import StudentDashboardView, StudentSubmissionListView
from .views import MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="student-me"),
    path("me/dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("me/submissions/", StudentSubmissionListView.as_view(), name="student-submissions"),
]
