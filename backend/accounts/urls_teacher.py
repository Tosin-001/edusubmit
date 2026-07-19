from django.urls import path

from academics.views import MyTeacherAssignmentsView
from assignments.views import AssignmentListCreateView
from submissions.views import LecturerDashboardView, LecturerSubmissionListView
from .views import MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="teacher-me"),
    path("me/dashboard/", LecturerDashboardView.as_view(), name="teacher-dashboard"),
    # New: the Teacher's own Subject x Class assignments (secondary-school pivot).
    path("me/assignments-taught/", MyTeacherAssignmentsView.as_view(), name="teacher-assignments-taught"),
    # NOTE (pivot in progress): the two endpoints below still operate on the
    # deprecated Assignment.course/lecturer fields, not the new
    # TeacherAssignment model. Full rewire to the class-scoped workflow is
    # pending — see PROJECT_STATUS.md "Phase B".
    path("me/assignments/", AssignmentListCreateView.as_view(), name="teacher-assignments"),
    path("me/submissions/", LecturerSubmissionListView.as_view(), name="teacher-submissions"),
]
