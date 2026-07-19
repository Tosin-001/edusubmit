from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("academics", "0003_subject_rename"),
        ("accounts", "0002_teacher_role_and_school_class"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeacherAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("school_class", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="teacher_assignments", to="academics.schoolclass",
                )),
                ("subject", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="teacher_assignments", to="academics.subject",
                )),
                ("teacher", models.ForeignKey(
                    limit_choices_to={"role": "teacher"}, on_delete=django.db.models.deletion.CASCADE,
                    related_name="teaching_assignments", to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"ordering": ["subject__name", "school_class__name"]},
        ),
        migrations.AlterUniqueTogether(
            name="teacherassignment",
            unique_together={("subject", "school_class")},
        ),
    ]
