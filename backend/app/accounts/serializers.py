from rest_framework import serializers
from .models import Activity, CustomUser

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

# serializers.py
from rest_framework import serializers
from .models import Notification

from rest_framework import serializers
class NotificationSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'  # Or list specific fields including 'profile_picture_url'

    def get_profile_picture_url(self, obj):
        # Use request context to build the full URL for media files
        request = self.context.get('request')
        if obj.provider.profile_picture:
            return request.build_absolute_uri(obj.provider.profile_picture.url)
        return None
    
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomLoginUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'birthdate', 'phone_number', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['email'] = validated_data['email'].lower()
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user
    
# serializers.py
from rest_framework import serializers
from .models import Package
class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__' 

# serializers.py
from rest_framework import serializers
from .models import PackageSubscription, Package

class SubscriberSerializer(serializers.ModelSerializer):
    subscription_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'subscription_details']

    def get_subscription_details(self, obj):
        # Here, use 'obj' instead of 'user' to clarify it's the object being serialized
        subscription = PackageSubscription.objects.filter(user=obj, status='confirmed').first()
        if subscription:
            return {
                'remaining_bookings': subscription.package.number_of_bookings - subscription.bookings_made,
                'start_date': subscription.start_date.strftime("%Y-%m-%d"),
            }
        return None



from django.contrib.humanize.templatetags.humanize import intcomma



class PackageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.id')
    subscribers = serializers.SerializerMethodField()
    number_of_bookings = serializers.ReadOnlyField()  
    formatted_price = serializers.SerializerMethodField()

    class Meta:
        model = Package
        fields = ['id', 'name', 'description', 'duration', 'number_of_bookings', 'price', 'formatted_price', 'owner', 'subscribers']

    def get_subscribers(self, obj):
        subscriptions = PackageSubscription.objects.filter(package=obj, status='confirmed')
        subscribers = [subscription.user for subscription in subscriptions]  # Collect User instances
        return SubscriberSerializer(subscribers, many=True).data  # Seri
    
    def get_formatted_price(self, obj):
        # Format the price with commas for thousands
        return intcomma(obj.price)

from rest_framework import serializers

# serializers.py

from rest_framework import serializers
from .models import PackageSubscription
from rest_framework import serializers
from .models import PackageSubscription, Package
from django.db.models import F

# serializers.py
from rest_framework import serializers
from .models import PackageSubscription, Package

class PackageSubscriptionSerializer(serializers.ModelSerializer):
    remaining_bookings = serializers.SerializerMethodField()
    start_date = serializers.DateTimeField(format="%Y-%m-%d")  # Adjust the format as needed
    package = PackageSerializer(read_only=True)  # Nested serialization

    class Meta:
        model = PackageSubscription
        fields = ['id', 'start_date', 'status', 'user', 'package', 'remaining_bookings']

    def get_remaining_bookings(self, obj):
        return obj.calculate_remaining_bookings()

