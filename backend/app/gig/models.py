from django.db import models
from django.conf import settings

from django.db import models, transaction

class DayOfWeek(models.Model):
    name = models.CharField(max_length=9)  # For day names (Monday, Tuesday, etc.)

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
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, related_name='gigs')
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
    latitude = models.FloatField(null=True, blank=True)  # New field for latitude
    longitude = models.FloatField(null=True, blank=True)  

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super(Gig, self).save(*args, **kwargs)  # Call the "real" save method first to ensure the gig is saved
        
        if is_new:
            # Check if the gig is new to avoid creating duplicate instances for existing gigs
            if self.is_recurring:
                # If the gig is recurring, calculate and create multiple gig instances
                self.create_gig_instances()
            else:
                # For non-recurring gigs, create a single gig instance with the provided date
                self.create_single_gig_instance()

    def create_single_gig_instance(self):
        """Create a single gig instance for non-recurring gigs."""
        if self.date:
            # Only create an instance if a specific date is provided for the gig
            GigInstance.objects.create(
                gig=self,
                date=self.date,
                start_time=self.start_time,
                end_time=self.end_time
            )

    def calculate_gig_dates(self):
        """
        Generate a list of dates for the next 12 occurrences of the gig.
        This is a simplified example; adjust according to your recurrence logic.
        """
        if not self.is_recurring:
            return [self.date] if self.date else []

        # Example: Calculate the next 12 occurrences from today, for simplicity.
        # You should adjust this logic based on your actual recurrence pattern.
        start_date = datetime.now().date()
        dates = []
        for week in range(1, 13):  # Next 12 weeks
            gig_date = start_date + timedelta(weeks=week)
            dates.append(gig_date)
        return dates

    def create_gig_instances(self):
        with transaction.atomic():
            # Assuming you have a method to calculate the dates for GigInstances
            dates = self.calculate_gig_dates()
            for date in dates:
                GigInstance.objects.create(
                    gig=self,
                    date=date,
                    start_time=self.start_time,
                    end_time=self.end_time
                )


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
    bookings = models.PositiveIntegerField(default=0)  # Track the number of bookings

    class Meta:
        unique_together = ['gig', 'date', 'start_time']
    
    @property
    def remaining_slots(self):
        """Calculate the remaining slots for the gig instance."""
        return max(0, self.gig.max_people - self.bookings)


    def __str__(self):
        return f" User : {self.gig.provider.first_name} - {self.gig.title} - {self.date} ({self.start_time} - {self.end_time})"
from datetime import timedelta
import logging
logger = logging.getLogger(__name__)

