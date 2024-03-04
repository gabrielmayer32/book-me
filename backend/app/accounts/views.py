import json
from django.http import JsonResponse
from django.core.serializers import serialize
from django.conf import settings
import os
from .models import Subscription, CustomUser

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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Activity
from .serializers import ActivitySerializer, CustomUserSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from django.db.models import F
from django.db.models import Value, CharField
from django.db.models.functions import Concat
from django.views import View
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def toggle_subscription(request, provider_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        provider = CustomUser.objects.get(pk=provider_id, is_provider=True)
        subscription, created = Subscription.objects.get_or_create(subscriber=request.user, provider=provider)

        if not created:
            subscription.delete()
            return JsonResponse({'status': 'unsubscribed'})

        return JsonResponse({'status': 'subscribed'})

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'Provider not found'}, status=404)
    
class MarkNotificationsAsReadView(View):
    def put(self, request, *args, **kwargs):
        # Mark all notifications as read for the logged-in user
        Notification.objects.filter(recipient=request.user, unread=True).update(unread=False)
        return JsonResponse({'status': 'success'}, status=200)
    
class NotificationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(recipient=request.user, is_active=True).annotate(
            profile_picture_url=Concat(
                Value(settings.MEDIA_URL), 
                'provider__profile_picture', 
                output_field=CharField()
            )
        )
        serializer = NotificationSerializer(
            notifications, many=True, context={'request': request}
        )
        return Response(serializer.data)
    
class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, format=None):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.delete()  # Use the soft delete method
        return Response({'status': 'success', 'message': 'Notification deleted successfully.'})


class ActivityCollaboratorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, activity_id):
        activity = get_object_or_404(Activity, id=activity_id)
        collaborators = CustomUser.objects.filter(activity=activity, is_provider=True)
        serializer = CustomUserSerializer(collaborators, many=True, context={'request': request})
        return Response(serializer.data)
    
class ActivityList(APIView):
    def get(self, request, format=None):
        activities = Activity.objects.all()
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ActivitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import CustomUser, ExpoPushToken

@csrf_exempt
@require_POST
def receive_expo_push_token(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('userId')
        token = data.get('expoPushToken')
        
        user = CustomUser.objects.get(id=user_id)
        ExpoPushToken.objects.update_or_create(user=user, defaults={'token': token})
        
        return JsonResponse({"success": True, "message": "Token saved successfully."})
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=400)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username.lower(), password=password)
        if user is not None:
            login(request, user)
            if user.profile_picture and hasattr(user.profile_picture, 'url'):
                profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
            else:
                profile_picture_url = None
            print(profile_picture_url)
            user_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "isProvider": user.is_provider,
                "profilePicture": profile_picture_url,
            }

            if user.is_provider:
                # Initialize activity_info as None
                activity_info = None

                if user.activity:
                    # Manually construct activity_info
                    activity_info = {
                        # Include other fields from the activity model as needed
                        "name": user.activity.name,  # Example regular field
                        "category": user.activity.category.name,  # Example regular field
                        # Handle the ImageField by converting it to its URL
                        "image_url": request.build_absolute_uri(user.activity.image.url) if user.activity.image else None,
                    }

                social_media_info = list(user.social_media.values('platform__name', 'platform__icon_name', 'username'))

                user_info.update({
                    "bio": user.bio,
                    "phoneNumber": user.phone_number,
                    "activity": activity_info,
                    "socialMedia": social_media_info,
                })

                
            # # Additional info for providers
            # if user.is_provider:
            #     try:
            #         activity_info = model_to_dict(user.activity)
            #     except AttributeError:
            #         activity_info = None

            #     social_media_info = list(user.social_media.values('platform__name', 'platform__icon_name', 'username'))
            #     user_info.update({
            #         "bio": user.bio,
            #         "phoneNumber": user.phone_number,
            #         "activity": activity_info,
            #         "socialMedia": social_media_info,
            #     })

            csrf_token = get_token(request)  # Get or create the CSRF token
            return JsonResponse({"success": True, "user": user_info, "csrfToken": csrf_token}, status=200)
        else:
            return JsonResponse({"success": False, "message": "Invalid credentials."}, status=400)
    else:
        return JsonResponse({"success": False, "message": "Only POST requests are allowed."}, status=405)

def service_providers_list(request):
    current_user = request.user
    providers = CustomUser.objects.filter(is_provider=True).prefetch_related('social_media')
    providers_list = []

    for provider in providers:
        # Check if the current user is subscribed to the provider
        is_subscribed = Subscription.objects.filter(subscriber=current_user, provider=provider).exists()

        # Serialize provider to a Python dict
        provider_dict = {
            "id": provider.id,
            "first_name": provider.first_name,
            "email": provider.email,
            "bio": provider.bio,
            "phone_number": provider.phone_number,
            "businessName": provider.business_name,
            "activity": provider.activity.name if provider.activity else None,
            "profile_picture": request.build_absolute_uri(provider.profile_picture.url) if provider.profile_picture else None,
            "is_subscribed": is_subscribed,  # Add subscription status
            "socials": [
                {
                    "platform": social.platform.name,
                    "username": social.username,
                    "url": f"{social.platform.base_url}/{social.username}",
                    "icon": social.platform.icon_name
                } for social in provider.social_media.all()
            ]
        }
        providers_list.append(provider_dict)

    return JsonResponse({'providers': providers_list})
