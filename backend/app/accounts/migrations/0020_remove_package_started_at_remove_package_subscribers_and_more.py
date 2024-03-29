# Generated by Django 5.0.2 on 2024-03-07 09:43

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_package'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='package',
            name='started_at',
        ),
        migrations.RemoveField(
            model_name='package',
            name='subscribers',
        ),
        migrations.CreateModel(
            name='PackageSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateTimeField(auto_now_add=True)),
                ('package', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscribers', to='accounts.package')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
