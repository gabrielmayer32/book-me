# Generated by Django 5.0.2 on 2024-03-05 06:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0017_notification_notification'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notification',
            name='notification',
        ),
    ]
