# Generated by Django 5.0.2 on 2024-03-03 12:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0014_subscription'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='deep_link',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
