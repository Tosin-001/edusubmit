"""
Secondary-school pivot, part 3: Assignment gets teacher_assignment.
course/lecturer become nullable (deprecated, not dropped — pre-pivot
assignments have no natural Class mapping, so they are NOT auto-backfilled
into a fake TeacherAssignment; they simply won't appear in the new
class-scoped Teacher/Student views. Their data, grades, and submissions
are untouched and remain visible via Django admin).
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("academics", "0004_teacherassignment"),
        ("assignments", "0002_assignment_is_archived"),
    ]

    operations = [
        migrations.AddField(
            model_name="assignment",
            name="teacher_assignment",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                related_name="assignments", to="academics.teacherassignment",
            ),
        ),
        migrations.AlterField(
            model_name="assignment",
            name="course",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="assignments", to="academics.subject",
            ),
        ),
        migrations.AlterField(
            model_name="assignment",
            name="lecturer",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="assignments_created", to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="assignment",
            name="allowed_file_types",
            field=models.CharField(default="pdf,docx,doc", max_length=50),
        ),
    ]
