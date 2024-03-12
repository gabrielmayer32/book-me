from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings

from django.db import models
from django.contrib.auth import get_user_model



class ExpoPushToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expo_push_tokens')
    token = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.token

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Activity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to='activity_images/', null=True, blank=True)  # New image field
    def __str__(self):
        return self.name

from django.db import models

class SocialPlatform(models.Model):
    name = models.CharField(max_length=50, unique=True)
    base_url = models.URLField(max_length=250)
    icon_name = models.CharField(max_length=50, help_text="Name of the icon for this platform")

    def __str__(self):
        return self.name

class SocialMedia(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='social_media')
    platform = models.ForeignKey(SocialPlatform, on_delete=models.CASCADE)
    username = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user}'s {self.platform} account"


# Custom user model
class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True, max_length=500)
    activity = models.ForeignKey(Activity, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    business_name = models.CharField(max_length=100, blank=True, null=True)
    is_provider = models.BooleanField(default=False, help_text='Designates whether this user should be treated as a provider.')
    birthdate = models.DateField(null=True, blank=True)

from django.utils import timezone

class Notification(models.Model):
    recipient = models.ForeignKey(
        CustomUser, related_name='notifications', on_delete=models.CASCADE)
    actor = models.CharField(max_length=255)
    verb = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    action_object_url = models.URLField(blank=True, null=True)
    target_object_url = models.URLField(blank=True, null=True)
    provider = models.ForeignKey(
        CustomUser, related_name='provider_notifications', on_delete=models.CASCADE, null=True, blank=True)
    unread = models.BooleanField(default=True, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deep_link = models.CharField(max_length=255, blank=True, null=True)  # New field for deep linking

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.id} Notification for {self.recipient.username} - {self.verb}"

    def delete(self, *args, **kwargs):
        """
        Soft delete the notification by setting is_active to False and
        recording the deletion timestamp.
        """
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_active', 'deleted_at'])



User = get_user_model()

class Subscription(models.Model):
    subscriber = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    provider = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subscriber', 'provider')

    def __str__(self):
        return f"{self.subscriber} subscribes to {self.provider}"
    
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Package(models.Model):
    owner = models.ForeignKey(User, related_name='owned_packages', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    duration = models.IntegerField(validators=[MinValueValidator(1)], help_text="Duration in days.")
    number_of_bookings = models.IntegerField(validators=[MinValueValidator(0)], null=True, blank=True, help_text="Number of bookings allowed")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] 
    def __str__(self):
        return self.name

class PackageSubscription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
    ]

    user = models.ForeignKey(User, related_name='subscriptions', on_delete=models.CASCADE)
    package = models.ForeignKey(Package, related_name='subscribers', on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    bookings_made = models.IntegerField(default=0, validators=[MinValueValidator(0)])  # New field

    def __str__(self):
        return f"{self.user} subscribed to {self.package} on {self.start_date}"
    def calculate_remaining_bookings(self):
        total_bookings_allowed = self.package.number_of_bookings
        bookings_made = self.bookings.count()  # Assuming you have a related name 'bookings' in the Booking model
        return total_bookings_allowed - bookings_made
    
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status



from django.db import models

class PaymentInformation(models.Model):
    provider = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payment_information')
    accepts_cash = models.BooleanField(default=False, help_text='Accepts cash in hand')
    
    # For MCB Juice, which generally uses a phone number
    mcb_juice_enabled = models.BooleanField(default=False, help_text='Accepts MCB Juice payments')
    mcb_juice_number = models.CharField(max_length=20, blank=True, null=True, help_text='MCB Juice phone number')
    
    # For Internet Banking, details might include bank name and account number
    internet_banking_enabled = models.BooleanField(default=False, help_text='Accepts internet banking payments')
    internet_banking_details = models.TextField(blank=True, null=True, help_text='Internet banking details')
    
    # For payments by card, this might just be a boolean since actual card payments are not handled on the platform
    accepts_card = models.BooleanField(default=False, help_text='Accepts card payments')

    def __str__(self):
        return f"Payment Information for {self.provider.username}"

