"""
Secondary-school pivot: tighten allowed upload types to PDF/DOC/DOCX only
(zip removed) per the new security requirements. Existing submitted zip
files are untouched on disk/DB — this only affects new uploads going
forward, it does not retroactively invalidate anything.
"""
from django.core.validators import FileExtensionValidator
from django.db import migrations, models

import submissions.models


class Migration(migrations.Migration):

    dependencies = [
        ("submissions", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="submission",
            name="file",
            field=models.FileField(
                upload_to=submissions.models.submission_upload_path,
                validators=[FileExtensionValidator(["pdf", "docx", "doc"]), submissions.models.validate_file_size],
            ),
        ),
    ]
