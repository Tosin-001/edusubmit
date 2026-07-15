from django.conf import settings
from django.db import models


class Course(models.Model):
    """
    Courses are Admin-assigned: only Admins create courses and set/reassign
    the lecturer_id. Lecturers cannot self-create courses (per project decision,
    2026-07-14 — see PROJECT_STATUS.md).
    """

    course_code = models.CharField(max_length=20)
    course_title = models.CharField(max_length=200)
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="courses_taught",
        limit_choices_to={"role": "lecturer"},
    )
    semester = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["course_code"]
        unique_together = ["course_code", "semester"]

    def __str__(self):
        return f"{self.course_code} — {self.course_title}"
