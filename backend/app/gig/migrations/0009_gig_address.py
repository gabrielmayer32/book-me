# Generated by Django 5.0.2 on 2024-02-22 03:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0008_gig_latitude_gig_longitude'),
    ]

    operations = [
        migrations.AddField(
            model_name='gig',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
