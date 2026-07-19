from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    matric_number = models.CharField(max_length=30, unique=True, null=True, blank=True)
    staff_id = models.CharField(max_length=30, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    school_class = models.ForeignKey(
        "academics.SchoolClass",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
        help_text="Meaningful for Student role only — the one class a student belongs to.",
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.role})"

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    # Backward-compatible alias during the secondary-school pivot — remove once
    # all call sites are confirmed migrated off the old name.
    @property
    def is_lecturer(self):
        return self.is_teacher

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
