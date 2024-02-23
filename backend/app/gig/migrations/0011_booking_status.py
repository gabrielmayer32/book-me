# Generated by Django 5.0.2 on 2024-02-23 05:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0010_booking'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending', max_length=10),
        ),
    ]
