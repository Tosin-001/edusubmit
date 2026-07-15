from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from activitylogs.utils import log_action


class EduSubmitTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds role + full_name as claims so the frontend can route without a follow-up call."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        log_action(self.user, "auth.login")
        data["role"] = self.user.role
        data["full_name"] = self.user.full_name
        return data


class EduSubmitTokenObtainPairView(TokenObtainPairView):
    serializer_class = EduSubmitTokenObtainPairSerializer
    throttle_scope = "auth"
