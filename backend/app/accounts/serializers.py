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