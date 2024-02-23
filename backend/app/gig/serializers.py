from rest_framework import serializers

from gig.utils import fetch_address_from_lat_lng
from .models import Gig
from rest_framework import serializers
from .models import Gig, DayOfWeek

from rest_framework import serializers
from .models import Booking

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

    class Meta:
        model = Booking
        fields = ['id', 'gig_title', 'gig_date', 'gig_start_time', 'gig_end_time', 'provider_name', 'booked_on', 'number_of_slots', 'status', 'latitude', 'longitude']
        # Include any other fields you think are necessary for the frontend.


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
            print(address)
            validated_data['address'] = address

        gig = Gig.objects.create(**validated_data)

        if recurring_days_data:
            gig.recurring_days.set(recurring_days_data)
        
        return gig
    
from rest_framework import serializers
from .models import GigInstance

class GigInstanceSerializer(serializers.ModelSerializer):
    remaining_slots = serializers.SerializerMethodField()

    class Meta:
        model = GigInstance
        fields = ['gig', 'date', 'start_time', 'end_time', 'is_booked', 'remaining_slots']
    def get_remaining_slots(self, obj):
        """Returns the number of remaining slots for the gig instance."""
        return obj.remaining_slots