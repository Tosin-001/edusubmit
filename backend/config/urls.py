from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls_auth")),
    path("api/v1/students/", include("accounts.urls_student")),
    path("api/v1/lecturers/", include("accounts.urls_lecturer")),
    path("api/v1/admin/", include("accounts.urls_admin")),
    path("api/v1/courses/", include("academics.urls")),
    path("api/v1/assignments/", include("assignments.urls")),
    path("api/v1/submissions/", include("submissions.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
