from django.urls import path

from academics.views import MyTeacherAssignmentsView
from assignments.views import AssignmentListCreateView
from submissions.views import TeacherDashboardView, TeacherSubmissionListView
from .views import MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="teacher-me"),
    path("me/dashboard/", TeacherDashboardView.as_view(), name="teacher-dashboard"),
    # The teacher's own Subject x Class assignments (TeacherAssignment rows).
    path("me/assignments-taught/", MyTeacherAssignmentsView.as_view(), name="teacher-assignments-taught"),
    # Now correctly class-scoped: /assignments/ filters by teacher_assignment__teacher for teachers.
    path("me/assignments/", AssignmentListCreateView.as_view(), name="teacher-assignments"),
    path("me/submissions/", TeacherSubmissionListView.as_view(), name="teacher-submissions"),
]
