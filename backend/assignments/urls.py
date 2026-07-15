from django.urls import path

from .views import AssignmentDetailView, AssignmentListCreateView

urlpatterns = [
    path("", AssignmentListCreateView.as_view(), name="assignment-list"),
    path("<int:pk>/", AssignmentDetailView.as_view(), name="assignment-detail"),
]
