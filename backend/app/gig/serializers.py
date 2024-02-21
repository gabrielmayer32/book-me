from rest_framework import serializers
from .models import Gig
from rest_framework import serializers
from .models import Gig, DayOfWeek

class GigSerializer(serializers.ModelSerializer):
    recurring_days = serializers.PrimaryKeyRelatedField(
        queryset=DayOfWeek.objects.all(), many=True, required=False
    )


    class Meta:
        model = Gig
        exclude = ('provider',)

    def create(self, validated_data):
        recurring_days_data = validated_data.pop('recurring_days', None)
        gig = Gig.objects.create(**validated_data)
        if recurring_days_data:
            print('Create')
            print(recurring_days_data)
            gig.recurring_days.set(recurring_days_data)
        return gig
    
from rest_framework import serializers
from .models import GigInstance

class GigInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = GigInstance
        fields = ['gig', 'date', 'start_time', 'end_time', 'is_booked']
