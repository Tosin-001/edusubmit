from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ChangePasswordView, LogoutView, StudentRegisterView
from .token_views import EduSubmitTokenObtainPairView

urlpatterns = [
    path("register/student/", StudentRegisterView.as_view(), name="student-register"),
    path("login/", EduSubmitTokenObtainPairView.as_view(), name="token-obtain"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
