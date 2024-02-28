from django.db import models
from django.contrib.auth.models import AbstractUser

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
