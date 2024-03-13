import json
from django.http import JsonResponse
from django.core.serializers import serialize
from django.conf import settings
import os

from app.utils import send_push_notification
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
from .serializers import ActivitySerializer, CustomLoginUserSerializer, CustomUserSerializer, PackageSubscriptionSerializer
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
        print(token)
        
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

from django.contrib.auth import logout
from .models import ExpoPushToken

class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        # Retrieve the user's Expo Push Token
        expo_push_tokens = ExpoPushToken.objects.filter(user=request.user)
        print(expo_push_tokens)
        # Delete the tokens to disassociate them from the user
        expo_push_tokens.delete()
        
        # Logout the user
        logout(request)
        
        return Response({"success": "User logged out successfully"}, status=status.HTTP_200_OK)

from rest_framework import status, views
from rest_framework.response import Response
from .serializers import CustomUserSerializer

class CreateUserView(views.APIView):
    def post(self, request):
        print(request.data)
        serializer = CustomLoginUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class NotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(recipient=request.user, unread=True).count()
        print(count)
        return JsonResponse({"count": count})


from django.http import JsonResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import login
from .models import User  # Import your user model
from django.conf import settings

@csrf_exempt
def google_login(request):
    print(request.body)
    # This view expects a POST request with 'idToken' in the body
    if request.method == "POST":
        data = json.loads(request.body)
        
        # Extract the idToken from the parsed data
        token = data.get('idToken')
        try:
            print('ok')
            # Specify the GOOGLE_CLIENT_ID here
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            print(idinfo)
            # ID token is valid. Get or create the user.
            userid = idinfo['sub']
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', "")
            last_name = idinfo.get('family_name', "")
            print(email)
            user, created = User.objects.get_or_create(username=email, defaults={'first_name': first_name, 'last_name': last_name, 'email': email})
            
            if created:
                # If the user is created, you may set an unusable password if you don't want to use Google for all future logins
                user.set_unusable_password()
                user.save()

            # Authenticate the user
            login(request, user)

            # Prepare the user info response
            user_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "isProvider": user.is_provider,
                "profilePicture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            }
            csrf_token = get_token(request)
            print(csrf_token)
            return JsonResponse({"success": True, "user": user_info, "csrfToken": csrf_token}, status=200)
        
        except ValueError:
            # Invalid token
            return JsonResponse({"success": False, "error": "Invalid token"})


# views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Package
from .serializers import PackageSerializer

@api_view(['POST'])
def create_package(request):
    if request.method == 'POST':
        print(request.data)
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)  # Assuming the owner is the current user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['PUT'])
def update_package(request, package_id):

    try:
        package = Package.objects.get(id=package_id, owner=request.user)
    except Package.DoesNotExist:
        return Response({'error': 'Package not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PackageSerializer(package, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_package(request, package_id):
    print(package_id)
    try:
        package = Package.objects.get(id=package_id, owner=request.user)
        package.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Package.DoesNotExist:
        return Response({'error': 'Package not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def unsubscribe_user(request, subscription_id, user_id):
    user = get_object_or_404(User, id=user_id)
    subscription = get_object_or_404(PackageSubscription,  package__owner=request.user, user=user)
    print(subscription.user)
    # Here you might set it to 'unsubscribed' or delete the subscription
    # For this example, let's just delete the subscription
    subscription.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


from rest_framework import generics

class PackageList(generics.ListAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        print(queryset)  # Or use logging
        return queryset
    
class ProviderPackagesList(generics.ListAPIView):
    serializer_class = PackageSerializer

    def get_queryset(self):
        """
        This view should return a list of all the packages
        for the provider as determined by the providerId portion of the URL.
        """
        provider_id = self.kwargs['providerId']
        return Package.objects.filter(owner__id=provider_id)
    
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import PaymentInformation

@api_view(['GET'])
def get_payment_info(request, provider_id):
    try:
        # Use provider_id to filter PaymentInformation
        payment_info = PaymentInformation.objects.get(provider__id=provider_id)  # Adjusted from user to provider
        # Serialize your payment information here
        data = {
            "accepts_cash": payment_info.accepts_cash,
            "mcb_juice_number": payment_info.mcb_juice_number if payment_info.mcb_juice_enabled else None,
            "internet_banking_details": payment_info.internet_banking_details if payment_info.internet_banking_enabled else None,
            "accepts_card": payment_info.accepts_card,
        }
        return JsonResponse(data)
    except PaymentInformation.DoesNotExist:
        return JsonResponse({"error": "Payment information not found."}, status=404)

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Package, PackageSubscription

from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request, package_id):
    try:
        package = Package.objects.get(id=package_id)

        with transaction.atomic():
            # Check if the user already has a subscription to this package
            if PackageSubscription.objects.filter(user=request.user, package=package).exists():
                return JsonResponse({'error': 'You have already subscribed to this package.'}, status=400)

            # Create a new subscription with 'pending' status
            subscription = PackageSubscription.objects.create(
                user=request.user,
                package=package,
                status='pending'
            )

            # Create a notification for the package provider
            notification = Notification.objects.create(
                recipient=package.owner,
                actor=request.user.username,  # Assuming username is a meaningful identifier
                verb=f'subscribed to your package "{package.name}"',
                description=f'Your package "{package.name}" has been subscribed to.',
                action_object_url=f'/packages/{package_id}/'  # Adjust as needed
            )

            # Optionally, send push notification to the provider
            provider_tokens = ExpoPushToken.objects.filter(user=package.owner)
            for token in provider_tokens:
                send_push_notification(
                    token.token,
                    'New Package Subscription',
                    f'Your package "{package.name}" has been subscribed to.', {"targetScreen": "PackageDetail", "id": str(package.id)}
                )

            # Serialize the package data
            package_data = PackageSerializer(package).data

            return JsonResponse({
                'message': 'Subscription created successfully.',
                'subscription_id': subscription.id,
                'package': package_data  # Include package details in the response
            })

    except Package.DoesNotExist:
        return JsonResponse({'error': 'Package not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class PackageSubscriptionRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Filter subscriptions by the current user's packages and status 'pending'
        subscriptions = PackageSubscription.objects.filter(
            package__owner=request.user,
            status='pending'
        )
        serializer = PackageSubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)


class AcceptPackageSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subscription_id):
        with transaction.atomic():
            subscription = get_object_or_404(PackageSubscription, id=subscription_id, package__owner=request.user)
            subscription.status = 'confirmed'
            subscription.save()

            notification = Notification.objects.create(
                recipient=subscription.user,
                provider=request.user,
                actor=request.user.business_name,  # or `request.user.get_full_name()` depending on your preference
                verb='accepted your booking',
                description=f'Your package ordering, "{subscription.package.name}",  has been accepted.',
                # action_object_url=f'/gig/{subscription.gig_instance.id}/'  # Adjust URL as necessary for your frontend
            )

            # Sending push notification
            provider_tokens = ExpoPushToken.objects.filter(user=subscription.user)
            for token in provider_tokens:
                send_push_notification(
                    token.token,
                    'Package Booking Accepted',
                    f'{request.user.username} has accepted your booking package for "{subscription.package.name}".', {"targetScreen": "GigDetail"}
                )
            # Create and send notifications similarly as in AcceptBookingView

        return Response({"message": "Package subscription accepted."}, status=status.HTTP_200_OK)
    
class DeclinePackageSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subscription_id):
        with transaction.atomic():
            subscription = get_object_or_404(PackageSubscription, id=subscription_id, package__owner=request.user)
            subscription.status = 'declined'
            subscription.save()

            notification = Notification.objects.create(
                recipient=subscription.user,
                provider=request.user,
                actor=request.user.business_name,  # or `request.user.get_full_name()` depending on your preference
                verb='declined your booking',
                description=f'Your package ordering, "{subscription.package.name}",  has been declined.',
                # action_object_url=f'/gig/{subscription.gig_instance.id}/'  # Adjust URL as necessary for your frontend
            )

            # Sending push notification
            provider_tokens = ExpoPushToken.objects.filter(user=subscription.user)
            for token in provider_tokens:
                send_push_notification(
                    token.token,
                    'Package Booking Declined',
                    f'{request.user.username} has declined your booking package for "{subscription.package.name}".', {"targetScreen": "GigDetail"}
                )

        return Response({"message": "Package subscription declined."}, status=status.HTTP_200_OK)


from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_subscription(request):
    user = request.user

    # Try to get the subscription for the user
    subscription = PackageSubscription.objects.filter(user=user).first()

    if subscription:
        # Serialize the package data associated with the subscription
        package_data = serialize('json', [subscription.package], fields=('name', 'description', 'duration', 'number_of_bookings', 'price'))
        package_data = json.loads(package_data)[0]  # Serialize returns a list, get the first item
        print(package_data['fields'])
        return JsonResponse({
            'isSubscribed': True,
            'subscription': {
                'start_date': subscription.start_date,
                'status': subscription.status,
                'package': package_data['fields']  # Only include fields from package data
            }
        })

    return JsonResponse({'isSubscribed': False})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PackageSubscription
from .serializers import PackageSubscriptionSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_package_subscriptions(request):
    print(request.user)
    pending_subscriptions = PackageSubscription.objects.filter(package__owner=request.user, status='pending')
    serializer = PackageSubscriptionSerializer(pending_subscriptions, many=True)
    return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PackageSubscription
from .serializers import PackageSubscriptionSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
class UserPackageSubscriptionsView(APIView):
    def get(self, request, user_id, format=None):
        print("User ID:", user_id)  # Debug print

        # Ensure the user exists and matches the logged-in user or the user has permission to view
        user = get_object_or_404(User, pk=user_id)
        if request.user != user and not request.user.is_staff:
            return Response({"error": "You do not have permission to view these subscriptions."}, status=403)

        # Fetching confirmed subscriptions for the user
        subscriptions = PackageSubscription.objects.filter(
            user=user_id,
            status='confirmed'  # Filter by confirmed status
        ).select_related('package', 'package__owner')

        print("Subscriptions QuerySet:", subscriptions)  # Debug print to see if queryset is empty or contains data

        serializer = PackageSubscriptionSerializer(subscriptions, many=True)
        
        print("Serialized data:", serializer.data)  # Debug print to check serialization output
        
        return Response(serializer.data)


