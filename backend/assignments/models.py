from django.conf import settings
from django.db import models

from academics.models import Subject, TeacherAssignment


class Assignment(models.Model):
    """
    An assignment now belongs to a TeacherAssignment (Teacher x Subject x
    Class) rather than directly to a Course/Lecturer — this is what lets a
    Teacher create an assignment with only title/description/due date/max
    score, no Subject or Class dropdown: those are already fixed by which
    TeacherAssignment they opened.
    """

    teacher_assignment = models.ForeignKey(
        TeacherAssignment, on_delete=models.CASCADE, related_name="assignments", null=True, blank=True
    )

    # --- Deprecated, kept for data safety (no destructive migration) ---
    # Pre-pivot (university-model) assignments are NOT auto-backfilled into
    # teacher_assignment — they had no Class concept, so there's nothing
    # honest to backfill them into. They keep their data via these fields
    # and remain visible in Django admin, but won't appear in the new
    # class-scoped Teacher/Student views.
    course = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name="assignments")
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assignments_created",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    max_score = models.PositiveIntegerField(default=100)
    allowed_file_types = models.CharField(max_length=50, default="pdf,docx,doc")
    max_file_size_mb = models.PositiveIntegerField(default=15)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        if self.teacher_assignment:
            return f"{self.teacher_assignment.subject.name} ({self.teacher_assignment.school_class.name}) — {self.title}"
        return self.title
