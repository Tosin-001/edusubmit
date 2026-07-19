"""
Secondary-school pivot, part 1: rename Course -> Subject, add SchoolClass.
No destructive operations — RenameModel/RenameField preserve all existing
rows and IDs. lecturer/semester become nullable (deprecated, not dropped).
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("academics", "0002_initial"),
    ]

    operations = [
        migrations.RenameModel(old_name="Course", new_name="Subject"),
        migrations.RenameField(model_name="subject", old_name="course_code", new_name="code"),
        migrations.RenameField(model_name="subject", old_name="course_title", new_name="name"),
        migrations.AlterField(
            model_name="subject",
            name="code",
            field=models.CharField(max_length=20, null=True, blank=True),
        ),
        migrations.AlterUniqueTogether(name="subject", unique_together=set()),
        migrations.AlterField(
            model_name="subject",
            name="lecturer",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="subjects_taught_deprecated", to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="subject",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name="SchoolClass",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
                ("is_archived", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["name"], "verbose_name_plural": "School classes"},
        ),
    ]
