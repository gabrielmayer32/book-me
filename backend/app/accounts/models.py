from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings



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
