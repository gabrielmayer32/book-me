import json
from django.http import JsonResponse
from django.core.serializers import serialize
from django.conf import settings
import os
from .models import CustomUser, SocialMedia

from django.http import JsonResponse
from django.core import serializers
import json
from django.conf import settings

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from .models import CustomUser, SocialMedia
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username.lower(), password=password)
        if user is not None:
            login(request, user)
            # Initialize common user info
            user_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "isProvider": user.is_provider,
                "profilePicture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            }

            # Additional info for providers
            if user.is_provider:
                try:
                    activity_info = model_to_dict(user.activity)
                except AttributeError:
                    activity_info = None

                social_media_info = list(user.social_media.values('platform__name', 'platform__icon_name', 'username'))
                user_info.update({
                    "bio": user.bio,
                    "phoneNumber": user.phone_number,
                    "activity": activity_info,
                    "socialMedia": social_media_info,
                })

            csrf_token = get_token(request)  # Get or create the CSRF token
            return JsonResponse({"success": True, "user": user_info, "csrfToken": csrf_token}, status=200)
        else:
            return JsonResponse({"success": False, "message": "Invalid credentials."}, status=400)
    else:
        return JsonResponse({"success": False, "message": "Only POST requests are allowed."}, status=405)

def service_providers_list(request):
    providers = CustomUser.objects.filter(is_provider=True).prefetch_related('social_media')
    providers_list = []

    for provider in providers:
        # Serialize provider to a Python dict
        provider_dict = {
            "id": provider.id,
            "first_name": provider.first_name,
            "email": provider.email,
            "bio": provider.bio,
            "phone_number": provider.phone_number,
            # Assuming 'activity' is a related object with a 'name' attribute
            "activity": provider.activity.name if provider.activity else None,
            "profile_picture": request.build_absolute_uri(provider.profile_picture.url) if provider.profile_picture else None,
            "socials": [
                {
                    "platform": social.platform.name,
                    "username": social.username,
                    # Construct the full URL for the social media link
                    "url": f"{social.platform.base_url}/{social.username}",
                    "icon": social.platform.icon_name  # Ensure your SocialPlatform model includes an 'icon_name' field
                } for social in provider.social_media.all()
            ]
        }
        providers_list.append(provider_dict)

    return JsonResponse({'providers': providers_list})
