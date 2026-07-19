from django.conf import settings
from django.db import models


class Subject(models.Model):
    """
    Formerly "Course" (renamed 2026-07-19 for the secondary-school pivot —
    see CHANGELOG.md). A Subject no longer has a direct teacher; that
    relationship now goes through TeacherAssignment (Teacher x Subject x
    SchoolClass), since one teacher can teach the same subject to several
    classes, and a class has several subjects each with their own teacher.
    """

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Deprecated fields, kept for data safety (no destructive migration) ---
    # No longer read or written by any current code. Subject<->Teacher is now
    # expressed via TeacherAssignment. Safe to drop in a later cleanup
    # migration once you've confirmed nothing needs this history.
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects_taught_deprecated",
    )
    semester = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class SchoolClass(models.Model):
    """
    A class/level, e.g. "JS1", "SS2 Science". Admin-managed, no hardcoded
    values — Admin can create/edit/archive any class name that fits their
    school's structure.
    """

    name = models.CharField(max_length=50, unique=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "School classes"

    def __str__(self):
        return self.name


class TeacherAssignment(models.Model):
    """
    The Teacher x Subject x SchoolClass triple. Admin-controlled — teachers
    cannot assign themselves. One teacher per (subject, class) pair; a
    teacher can hold many TeacherAssignments (multiple subjects and/or
    multiple classes).
    """

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teaching_assignments",
        limit_choices_to={"role": "teacher"},
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="teacher_assignments")
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name="teacher_assignments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["subject", "school_class"]
        ordering = ["subject__name", "school_class__name"]

    def __str__(self):
        return f"{self.teacher.full_name} — {self.subject.name} — {self.school_class.name}"
