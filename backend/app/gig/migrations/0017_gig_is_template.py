# Generated by Django 5.0.2 on 2024-03-04 05:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0016_alter_booking_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='gig',
            name='is_template',
            field=models.BooleanField(default=False),
        ),
    ]
