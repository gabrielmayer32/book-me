# Generated by Django 5.0.2 on 2024-02-27 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0014_alter_giginstance_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='giginstance',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]