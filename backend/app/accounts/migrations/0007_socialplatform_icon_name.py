# Generated by Django 5.0.2 on 2024-02-20 05:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_category_activity_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='socialplatform',
            name='icon_name',
            field=models.CharField(default=1, help_text='Name of the icon for this platform', max_length=50),
            preserve_default=False,
        ),
    ]