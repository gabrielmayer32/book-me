# Generated by Django 5.0.2 on 2024-03-13 12:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0026_alter_package_number_of_bookings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='package',
            name='number_of_bookings',
            field=models.IntegerField(default=0),
        ),
    ]