from rest_framework import generics

from accounts.permissions import IsAdmin
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogListView(generics.ListAPIView):
    """GET /admin/activity-logs/ — paginated audit trail."""

    queryset = ActivityLog.objects.select_related("user").all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["action", "user"]
