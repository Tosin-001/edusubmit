"""
Seeds one demo Lecturer, one Course (assigned to that lecturer), and one
Assignment, so the Student upload flow has something to submit against
locally. Idempotent — safe to run more than once (uses get_or_create).

Usage: python manage.py seed_demo
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from academics.models import Course
from accounts.models import User
from assignments.models import Assignment

LECTURER_EMAIL = "lecturer@edusubmit.local"
LECTURER_PASSWORD = "8sdWXaBC2DAU4MI9"


class Command(BaseCommand):
    help = "Seed a demo lecturer, course, and assignment for local testing."

    def handle(self, *args, **options):
        lecturer, created = User.objects.get_or_create(
            email=LECTURER_EMAIL,
            defaults={
                "role": User.Role.LECTURER,
                "full_name": "Dr. Adaeze Nwosu",
                "staff_id": "LEC/2026/001",
                "department": "Computer Science",
            },
        )
        if created:
            lecturer.set_password(LECTURER_PASSWORD)
            lecturer.save()
            self.stdout.write(self.style.SUCCESS(f"Created lecturer: {LECTURER_EMAIL}"))
        else:
            self.stdout.write("Lecturer already exists, skipping.")

        course, _ = Course.objects.get_or_create(
            course_code="CSC301",
            semester="2025/2026 First",
            defaults={
                "course_title": "Introduction to Software Engineering",
                "lecturer": lecturer,
            },
        )
        if course.lecturer_id != lecturer.id:
            course.lecturer = lecturer
            course.save()
        self.stdout.write(self.style.SUCCESS(f"Course ready: {course.course_code}"))

        assignment, created = Assignment.objects.get_or_create(
            course=course,
            title="Assignment 1: Project Proposal",
            defaults={
                "lecturer": lecturer,
                "description": "Submit a 2-3 page proposal outlining your final project idea, "
                "scope, and tech stack.",
                "due_date": timezone.now() + timedelta(days=14),
                "max_score": 100,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Assignment ready: {assignment.title}"))
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Demo lecturer login:"))
        self.stdout.write(f"  email: {LECTURER_EMAIL}")
        self.stdout.write(f"  password: {LECTURER_PASSWORD}")
