# Generated by Django 5.0.2 on 2024-02-27 04:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0013_giginstance_max_people'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='giginstance',
            unique_together={('id', 'gig', 'date', 'start_time')},
        ),
    ]