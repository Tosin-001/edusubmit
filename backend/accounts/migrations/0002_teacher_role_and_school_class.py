"""
Secondary-school pivot, part 2: Role.LECTURER -> Role.TEACHER.

This is a genuine data migration, not just a code rename: existing rows in
the database literally contain the string 'lecturer'. Renaming the Python
enum value without rewriting those rows would silently break `is_teacher`
for every existing teacher account. The RunPython step below fixes that.
Reversible (re-migrating down restores 'lecturer').
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def lecturer_to_teacher(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role="lecturer").update(role="teacher")


def teacher_to_lecturer(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role="teacher").update(role="lecturer")


class Migration(migrations.Migration):

    dependencies = [
        ("academics", "0003_subject_rename"),
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[("student", "Student"), ("teacher", "Teacher"), ("admin", "Admin")],
                default="student", max_length=20,
            ),
        ),
        migrations.RunPython(lecturer_to_teacher, reverse_code=teacher_to_lecturer),
        migrations.AddField(
            model_name="user",
            name="school_class",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="students", to="academics.schoolclass",
                help_text="Meaningful for Student role only — the one class a student belongs to.",
            ),
        ),
    ]
