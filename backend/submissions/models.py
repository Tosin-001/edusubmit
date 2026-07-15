import os

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models

from assignments.models import Assignment


def submission_upload_path(instance, filename):
    return f"submissions/{instance.assignment.course.course_code}/{instance.student_id}/{filename}"


def validate_file_size(value):
    max_mb = getattr(settings, "MAX_UPLOAD_SIZE_MB", 15)
    if value.size > max_mb * 1024 * 1024:
        raise ValidationError(f"File exceeds the {max_mb}MB limit.")


class Submission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        REVIEWED = "reviewed", "Reviewed"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="submissions",
        limit_choices_to={"role": "student"},
    )
    file = models.FileField(
        upload_to=submission_upload_path,
        validators=[FileExtensionValidator(["pdf", "docx", "doc", "zip"]), validate_file_size],
    )
    file_name = models.CharField(max_length=255, blank=True)
    file_size_kb = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    grade = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    review_notes = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews_done",
    )

    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["student", "status"]),
            models.Index(fields=["assignment"]),
        ]

    def __str__(self):
        return f"{self.student} — {self.assignment.title} ({self.status})"

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = os.path.basename(self.file.name)
        if self.file:
            try:
                self.file_size_kb = self.file.size // 1024
            except Exception:
                pass
        super().save(*args, **kwargs)
