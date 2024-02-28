from rest_framework import serializers

from gig.utils import fetch_address_from_lat_lng
from .models import Gig
from rest_framework import serializers
from .models import Gig, DayOfWeek

from rest_framework import serializers
from .models import Booking

from rest_framework import serializers
from .models import Booking
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Booking, GigInstance
# User serializer (as defined previously)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name']  # Add other fields you need

# Define a serializer for the GigInstance model
class GigInstanceSerializer(serializers.ModelSerializer):
    gig_title = serializers.ReadOnlyField(source='gig.title')
    class Meta:
        model = GigInstance
        fields = ['id', 'date', 'start_time', 'end_time', 'max_people', 'address', 'gig_title']  # Add other fields you need

# Update the MainBookingSerializer to include user information and gig instance details
class MainBookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    gig_instance_details = GigInstanceSerializer(source='gig_instance', read_only=True)  # Add a nested serializer for the gig instance

    class Meta:
        model = Booking
        fields = '__all__'  # Include all fields from the Booking model
        depth = 1


class BookingSerializer(serializers.ModelSerializer):
    # Add any additional fields or methods you need here. For example, you might want to display
    # the title of the gig, the start and end time of the gig instance, and the booking status.
    gig_title = serializers.ReadOnlyField(source='gig_instance.gig.title')
    gig_start_time = serializers.ReadOnlyField(source='gig_instance.start_time')
    gig_end_time = serializers.ReadOnlyField(source='gig_instance.end_time')
    gig_date = serializers.ReadOnlyField(source='gig_instance.date')
    provider_name = serializers.ReadOnlyField(source='gig_instance.gig.provider.fist_name')
    latitude = serializers.ReadOnlyField(source='gig_instance.gig.latitude')
    longitude = serializers.ReadOnlyField(source='gig_instance.gig.longitude')
    provider_profile_picture = serializers.SerializerMethodField()
    number_of_slots = serializers.IntegerField(min_value=1, max_value=10)
    provider_name = serializers.ReadOnlyField(source='gig_instance.gig.provider.first_name')
    address = serializers.ReadOnlyField(source='gig_instance.gig.address')

    class Meta:
        model = Booking
        fields = ['id', 'gig_title', 'gig_date', 'gig_start_time', 'gig_end_time', 'provider_name', 'booked_on', 'address', 'number_of_slots', 'status', 'latitude', 'longitude', 'provider_profile_picture', 'provider_name']
        # Include any other fields you think are necessary for the frontend.

    def get_provider_profile_picture(self, obj):
        """
        Returns the absolute URL of the provider's profile picture if it exists, otherwise None.
        """
        request = self.context.get('request')
        if obj.gig_instance.gig.provider.profile_picture:
            return request.build_absolute_uri(obj.gig_instance.gig.provider.profile_picture.url)
        return None
    

class DashboardGigInstanceSerializer(serializers.ModelSerializer):
    instances = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = ['title', 'description', 'address', 'price', 'max_people', 'date_posted', 'last_updated', 'instances']

    def get_instances(self, obj):
        instances = obj.instances.all()  # Assuming your related_name for GigInstance is 'instances'
        return GigInstanceSerializer(instances, many=True).data

    
from .models import Gig, DayOfWeek, GigInstance
from django.db import transaction

class GigSerializer(serializers.ModelSerializer):
    recurring_days = serializers.PrimaryKeyRelatedField(
        queryset=DayOfWeek.objects.all(), many=True, required=False
    )

    class Meta:
        model = Gig
        exclude = ('provider',)

    def create(self, validated_data):
        recurring_days_data = validated_data.pop('recurring_days', None)
        latitude = validated_data.get('latitude')
        longitude = validated_data.get('longitude')

        # Fetch the address using latitude and longitude
        if latitude is not None and longitude is not None:
            address = fetch_address_from_lat_lng(latitude, longitude)
            validated_data['address'] = address

        gig = Gig.objects.create(**validated_data)

        if recurring_days_data:
            gig.recurring_days.set(recurring_days_data)


        if gig.is_recurring:
            self.create_recurring_gig_instances(gig)

        return gig

    def create_recurring_gig_instances(self, gig):
        with transaction.atomic():
            dates = gig.calculate_gig_dates()
            print(f"Creating gig instances for gig {gig.id} with max_people: {gig.max_people}")
            for date in dates:
                GigInstance.objects.create(
                    gig=gig,
                    date=date,
                    start_time=gig.start_time,
                    end_time=gig.end_time,
                    max_people=gig.max_people,
                    address = gig.address
                )

    
from rest_framework import serializers
from .models import GigInstance



class ExtendedGigSerializer(serializers.ModelSerializer):
    instances = GigInstanceSerializer(many=True, read_only=True)  # or another appropriate field name

    class Meta:
        model = Gig
        fields = '__all__'  # Include all fields or specify fields you need
