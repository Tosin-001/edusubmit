from .models import ActivityLog


def log_action(user, action, metadata=None, ip_address=None):
    """Fire-and-forget audit log write. Never raises — logging must not break the request."""
    try:
        ActivityLog.objects.create(user=user, action=action, metadata=metadata, ip_address=ip_address)
    except Exception:
        pass
