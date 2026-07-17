from rest_framework import generics

from accounts.permissions import IsAdmin
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogListView(generics.ListAPIView):
    """
    GET /admin/activity-logs/ — paginated audit trail.
    Filter: ?action=, ?user=
    Search: ?search= (action, user name/email)
    Date range: ?date_from=YYYY-MM-DD, ?date_to=YYYY-MM-DD
    """

    queryset = ActivityLog.objects.select_related("user").all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["action", "user"]
    search_fields = ["action", "user__full_name", "user__email"]

    def get_queryset(self):
        qs = super().get_queryset()
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(timestamp__date__gte=date_from)
        if date_to:
            qs = qs.filter(timestamp__date__lte=date_to)
        return qs
