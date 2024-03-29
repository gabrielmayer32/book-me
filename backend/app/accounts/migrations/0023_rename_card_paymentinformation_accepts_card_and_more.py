# Generated by Django 5.0.2 on 2024-03-07 15:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0022_paymentinformation'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paymentinformation',
            old_name='card',
            new_name='accepts_card',
        ),
        migrations.RenameField(
            model_name='paymentinformation',
            old_name='cash_in_hand',
            new_name='accepts_cash',
        ),
        migrations.RenameField(
            model_name='paymentinformation',
            old_name='internet_banking',
            new_name='internet_banking_enabled',
        ),
        migrations.RenameField(
            model_name='paymentinformation',
            old_name='mcb_juice',
            new_name='mcb_juice_enabled',
        ),
        migrations.AddField(
            model_name='paymentinformation',
            name='internet_banking_details',
            field=models.TextField(blank=True, help_text='Internet banking details', null=True),
        ),
        migrations.AddField(
            model_name='paymentinformation',
            name='mcb_juice_number',
            field=models.CharField(blank=True, help_text='MCB Juice phone number', max_length=20, null=True),
        ),
    ]
