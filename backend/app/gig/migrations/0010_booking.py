# Generated by Django 5.0.2 on 2024-02-22 06:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gig', '0009_gig_address'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booked_on', models.DateTimeField(auto_now_add=True)),
                ('number_of_slots', models.PositiveIntegerField()),
                ('gig_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gig_bookings', to='gig.giginstance')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
