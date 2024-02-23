from django.shortcuts import get_object_or_404
from accounts.models import CustomUser  # Or your custom user model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking, Gig
from .serializers import BookingSerializer, GigSerializer


from rest_framework import status

from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Gig, GigInstance
from django.conf import settings
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from .models import GigInstance
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone

class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)

        # Ensure that users can only cancel their own bookings or providers can cancel any bookings for their gigs
        if booking.user != request.user and booking.gig_instance.gig.provider != request.user:
            return Response({'error': 'You do not have permission to cancel this booking.'}, status=403)

        # Here you could also update the booking status to "Cancelled" instead of deleting
        booking.delete()

        return Response({'message': 'Booking cancelled successfully.'})


class UserBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Ensure that users can only access their own bookings
        if request.user.id != user_id and not request.user.is_staff:
            return Response({'error': 'You do not have permission to view these bookings.'}, status=403)

        bookings = Booking.objects.filter(user_id=user_id).order_by('-booked_on')
        
        serializer = BookingSerializer(bookings, many=True)
        print(serializer.data)
        return Response(serializer.data)

class BookGigView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        gig_instance_id = request.data.get('gig_instance_id')
        number_of_slots = request.data.get('number_of_slots')
        
        gig_instance = GigInstance.objects.get(id=gig_instance_id)
        if gig_instance.is_fully_booked:
            return Response({'error': 'This gig is fully booked.'}, status=400)

        booking = Booking.objects.create(
            user=request.user,
            gig_instance=gig_instance,
            number_of_slots=number_of_slots,
            status=Booking.StatusChoices.PENDING 

        )

        return Response({'message': 'Booking successful.', 'booking_id': booking.id})
from django.utils import timezone
from django.db.models import ExpressionWrapper, F, DateTimeField

from django.utils import timezone
import pytz
from datetime import datetime

class UpcomingGigsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        provider_id = kwargs.get('provider_id')
        User = get_user_model()
        provider = get_object_or_404(User, pk=provider_id)

        now = timezone.now()
        three_months_later = now.date() + timedelta(days=90)

        # First, get IDs of gigs that the user has already booked
        user_booked_gig_instance_ids = Booking.objects.filter(
            user=request.user
        ).values_list('gig_instance_id', flat=True)

        potential_gigs = GigInstance.objects.filter(
            gig__provider=provider,
            date__range=[now.date(), three_months_later]
        ).exclude(
            id__in=user_booked_gig_instance_ids  # Exclude gigs the user has already booked
        ).order_by('date', 'start_time')

        gigs = [
            gig for gig in potential_gigs
            if gig.remaining_slots > 0 and datetime.combine(gig.date, gig.start_time, tzinfo=pytz.UTC) > now
        ]

        gigs_data = [{
            'id': gig.id,
            'title': gig.gig.title,
            'description': gig.gig.description,
            'date': gig.date,
            'start_time': gig.start_time.strftime("%H:%M"),  # Adjust formatting as needed
            'end_time': gig.end_time.strftime("%H:%M"),  # Adjust formatting as needed
            'is_booked': gig.is_booked,
            'remaining_slots': gig.remaining_slots,
            'latitude': gig.gig.latitude,
            'longitude': gig.gig.longitude,
            'address': gig.gig.address,
        } for gig in gigs]

        return Response(gigs_data)



class CreateGigView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = GigSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(provider=request.user)  # Automatically set the provider
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  # Log or print for debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ProviderGigsView(APIView):
    """
    Retrieve gigs created by a specific provider.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve providerId from request query parameters
        provider_id = request.query_params.get('providerId')
        
        # Optional: Check if the providerId is for the logged-in user, if needed
        # if str(request.user.id) != provider_id:
        #     return Response({"error": "Unauthorized"}, status=401)
        
        # Get the provider's gigs using the providerId
        provider = get_object_or_404(CustomUser, pk=provider_id)
        provider_gigs = Gig.objects.filter(provider=provider)
        
        serializer = GigSerializer(provider_gigs, many=True)
        return Response(serializer.data)
