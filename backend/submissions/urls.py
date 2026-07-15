from django.urls import path

from .views import (
    AdminSubmissionDeleteView,
    AdminSubmissionListView,
    SubmissionCreateView,
    SubmissionDetailView,
    SubmissionDownloadView,
    SubmissionReviewView,
)

urlpatterns = [
    path("", SubmissionCreateView.as_view(), name="submission-create"),
    path("<int:pk>/", SubmissionDetailView.as_view(), name="submission-detail"),
    path("<int:pk>/review/", SubmissionReviewView.as_view(), name="submission-review"),
    path("<int:pk>/download/", SubmissionDownloadView.as_view(), name="submission-download"),
    path("admin/all/", AdminSubmissionListView.as_view(), name="admin-submission-list"),
    path("admin/<int:pk>/delete/", AdminSubmissionDeleteView.as_view(), name="admin-submission-delete"),
]
