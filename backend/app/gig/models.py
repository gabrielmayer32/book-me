from django.db import models
from django.conf import settings

from django.db import models, transaction

class DayOfWeek(models.Model):
    name = models.CharField(max_length=9)  # For day names (Monday, Tuesday, etc.)

    @property
    def weekday(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days.index(self.name)

    def __str__(self):
        return self.name



class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime

class Gig(models.Model):
    title = models.CharField(max_length=255)
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gigs')
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='gigs')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    max_people = models.PositiveIntegerField()
    date_posted = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_recurring = models.BooleanField(default=False)
    recurring_days = models.ManyToManyField('DayOfWeek', blank=True, related_name='gigs')
    date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)  
    longitude = models.FloatField(null=True, blank=True)  
    address = models.CharField(max_length=255, null=True, blank=True)
    is_template = models.BooleanField(default=False)
    package_unapplicable = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super(Gig, self).save(*args, **kwargs)  
        
        if is_new:
            if self.is_recurring:
                self.create_gig_instances()
            else:
                self.create_single_gig_instance()

    def create_gig_instances(self, duration_months=1, duration_weeks=0):
        """Create gig instances for a recurring gig with specified duration."""
        with transaction.atomic():
            dates = self.calculate_gig_dates(duration_months, duration_weeks)
            for date in dates:
                GigInstance.objects.create(
                    gig=self,
                    date=date,
                    start_time=self.start_time,
                    end_time=self.end_time,
                    max_people=self.max_people,
                    address=self.address
                )

    def create_single_gig_instance(self):
        """Create a single gig instance for non-recurring gigs."""
        if self.date:
            GigInstance.objects.create(
                gig=self,
                date=self.date,
                start_time=self.start_time,
                end_time=self.end_time,
                max_people=self.max_people,
                address=self.address
            )


    def calculate_gig_dates(self, duration_months=0, duration_weeks=0):
        if not self.is_recurring or not self.recurring_days.exists():
            return []

        # Initialize start_date to the next day to ensure we don't double count
        start_date = datetime.now().date() + timedelta(days=1)
        months_added = timedelta(days=30 * duration_months)  # Approximate months to days
        weeks_added = timedelta(weeks=duration_weeks)
        end_date = datetime.now().date() + months_added + weeks_added

        recurring_weekdays = [day.weekday for day in self.recurring_days.all()]
        dates = []

        while start_date <= end_date:
            if start_date.weekday() in recurring_weekdays:
                dates.append(start_date)
            start_date += timedelta(days=1)

        return dates



   


    def __str__(self):
        return self.title


    def __str__(self):
        return self.title


    def __str__(self):
        return self.title


from django.db import models



class GigInstance(models.Model):
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='instances')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_booked = models.BooleanField(default=False)
    bookings = models.PositiveIntegerField(default=0)
    max_people = models.PositiveIntegerField()
    address = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ['id', 'gig', 'date', 'start_time']
    
    @property
    def remaining_slots(self):
        """Calculate the remaining slots for the gig instance."""
        total_booked_slots = sum(booking.number_of_slots for booking in self.gig_bookings.all())
        return max(0, self.max_people - total_booked_slots)  # Use this instance's max_people

    @property
    def is_fully_booked(self):
        return self.remaining_slots <= 0


    def __str__(self):
        return f" [{self.id}] User : {self.gig.provider.first_name} - {self.gig.title} - {self.date} ({self.start_time} - {self.end_time})"
from datetime import timedelta
import logging
from accounts.models import PackageSubscription 
logger = logging.getLogger(__name__)

class Booking(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        CANCELED = 'canceled', 'Canceled'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    gig_instance = models.ForeignKey('GigInstance', on_delete=models.CASCADE, related_name='gig_bookings')
    booked_on = models.DateTimeField(auto_now_add=True)
    number_of_slots = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    event_id = models.CharField(max_length=255, null=True, blank=True)
    notification = models.ForeignKey('accounts.Notification', on_delete=models.SET_NULL, null=True, blank=True, related_name='booking_notifications')
    package_subscription = models.ForeignKey('accounts.PackageSubscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')  # Added line
    def __str__(self):
        return f"{self.user.username} booked {self.number_of_slots} slots for {self.gig_instance.gig.title} on {self.booked_on.strftime('%Y-%m-%d')} - {self.status}"
    
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingSerializer

