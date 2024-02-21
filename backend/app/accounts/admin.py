from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Activity, SocialMedia, SocialPlatform, Category

class CustomUserAdmin(BaseUserAdmin):
    model = CustomUser
    # Fieldsets for viewing and editing an existing user (None represents the title of the fieldset)
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Personal info'), {'fields': ('bio', 'activity', 'phone_number', 'profile_picture', 'is_provider')}),
    )
    # Fieldsets for creating a new user
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_('Personal info'), {'fields': ('bio', 'activity', 'phone_number', 'profile_picture', 'is_provider',)}),
    )
    list_display = ['username', 'email', 'is_provider', 'is_staff']  # Customizes the columns in the admin user list

# Register the admin model
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Activity)
admin.site.register(SocialPlatform)
admin.site.register(SocialMedia)
admin.site.register(Category)
