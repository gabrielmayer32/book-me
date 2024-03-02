from django.shortcuts import get_object_or_404
from accounts.models import CustomUser, ExpoPushToken  # Or your custom user model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.utils import send_push_notification
from .models import Booking, Gig
from .serializers import BookingSerializer, DashboardGigInstanceSerializer, ExtendedGigSerializer, GigInstanceSerializer, GigSerializer, MainBookingSerializer


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

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs.get('user_id')
        if request.user.id != int(user_id) and not request.user.is_staff:
            return Response({'error': 'You do not have permission to view these bookings.'}, status=403)
        
        # Get the current date and time
        now = timezone.now()

        # Filter bookings to exclude those with gig instances in the past
        # This comparison checks both the date and the time
        bookings = Booking.objects.filter(
            user_id=user_id,
            gig_instance__date__gt=now.date()
        ) | Booking.objects.filter(
            user_id=user_id,
            gig_instance__date=now.date(),
            gig_instance__start_time__gt=now.time()
        ).order_by('-booked_on')
        
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
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
        provider_tokens = ExpoPushToken.objects.filter(user=gig_instance.gig.provider)
        for token in provider_tokens:
            send_push_notification(
                token.token,
                'New Booking',
                f'Your gig "{gig_instance.gig.title}" has been booked.'
            )

        return Response({'message': 'Booking successful.', 'booking_id': booking.id})
from django.utils import timezone
from django.db.models import ExpressionWrapper, F, DateTimeField
from django.db.models import Count, Prefetch

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

        gig_instances = GigInstance.objects.filter(
            gig__provider=provider,
            date__range=[now.date(), three_months_later],
            gig_bookings__status=Booking.StatusChoices.ACCEPTED,
            start_time__gt=now.time()  # Ensure start time is in the future
        ).annotate(
            confirmed_bookings_count=Count('gig_bookings', filter=Q(gig_bookings__status=Booking.StatusChoices.ACCEPTED))
        ).prefetch_related(
            Prefetch('gig_bookings', queryset=Booking.objects.select_related('user').filter(status=Booking.StatusChoices.ACCEPTED))
        ).distinct().order_by('date', 'start_time')

        gigs_data = []
        for gig_instance in gig_instances:
            if gig_instance.confirmed_bookings_count > 0:
                bookings_data = []
                for booking in gig_instance.gig_bookings.all():
                    bookings_data.append({
                        'user_id': booking.user.id,
                        'user_name': booking.user.get_full_name(),
                        'user_email': booking.user.email,
                        'number_of_slots': booking.number_of_slots
                    })
                
                gigs_data.append({
                    'id': gig_instance.id,
                    'title': gig_instance.gig.title,
                    'description': gig_instance.gig.description,
                    'date': gig_instance.date.strftime("%Y-%m-%d"),
                    'start_time': gig_instance.start_time.strftime("%H:%M"),
                    'end_time': gig_instance.end_time.strftime("%H:%M") if gig_instance.end_time else None,
                    'latitude': gig_instance.gig.latitude,
                    'longitude': gig_instance.gig.longitude,
                    'address': gig_instance.gig.address,
                    'bookings': bookings_data,  # Include the list of bookings for this gig instance
                })
        print(gigs_data)
        return Response(gigs_data)

class ProviderUpcomingGigsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        provider_id = kwargs.get('provider_id')
        User = get_user_model()
        provider = get_object_or_404(User, pk=provider_id)

        now = timezone.now()
        three_months_later = now.date() + timedelta(days=90)

        gig_instances = GigInstance.objects.filter(
            gig__provider=provider,
            date__range=[now.date(), three_months_later],
            gig_bookings__status=Booking.StatusChoices.ACCEPTED,
            start_time__gt=now.time()  # Ensure start time is in the future
        ).annotate(
            confirmed_bookings_count=Count('gig_bookings', filter=Q(gig_bookings__status=Booking.StatusChoices.ACCEPTED))
        ).prefetch_related(
            Prefetch('gig_bookings', queryset=Booking.objects.select_related('user').filter(status=Booking.StatusChoices.ACCEPTED))
        ).distinct().order_by('date', 'start_time')

        gigs_data = []
        for gig_instance in gig_instances:
            if gig_instance.confirmed_bookings_count > 0:
                bookings_data = []
                for booking in gig_instance.gig_bookings.all():
                    bookings_data.append({
                        'user_id': booking.user.id,
                        'user_name': booking.user.get_full_name(),
                        'user_email': booking.user.email,
                        'number_of_slots': booking.number_of_slots
                    })
                
                gigs_data.append({
                    'id': gig_instance.id,
                    'title': gig_instance.gig.title,
                    'description': gig_instance.gig.description,
                    'date': gig_instance.date.strftime("%Y-%m-%d"),
                    'start_time': gig_instance.start_time.strftime("%H:%M"),
                    'end_time': gig_instance.end_time.strftime("%H:%M") if gig_instance.end_time else None,
                    'latitude': gig_instance.gig.latitude,
                    'longitude': gig_instance.gig.longitude,
                    'address': gig_instance.gig.address,
                    'max_people': gig_instance.gig.max_people,
                    'bookings': bookings_data,  # Include the list of bookings for this gig instance
                })
        print(gigs_data)
        return Response(gigs_data)
    
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
            user=request.user,
            status=Booking.StatusChoices.PENDING

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
        print(request.data)
        if serializer.is_valid():
            serializer.save(provider=request.user)  
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

from rest_framework.pagination import PageNumberPagination


class GigInstancesView(APIView):
    """
    Retrieve a specific gig along with its instances.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, gig_id):
        gig = get_object_or_404(Gig, pk=gig_id, provider=request.user)

        # Since ExtendedGigSerializer already handles instances, just serialize the gig
        serializer = ExtendedGigSerializer(gig, context={'request': request})
        print(serializer.data)
        return Response(serializer.data)
    
class BookingRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Filter bookings by the current user's gigs and status 'PENDING'
        bookings = Booking.objects.filter(
            gig_instance__gig__provider=request.user,
            status=Booking.StatusChoices.PENDING
        )
        serializer = MainBookingSerializer(bookings, many=True)
        return Response(serializer.data)

from rest_framework import status

class AcceptBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id, gig_instance__gig__provider=request.user)
        booking.status = Booking.StatusChoices.ACCEPTED
        booking.save()

        provider_tokens = ExpoPushToken.objects.filter(user=booking.user)
        for token in provider_tokens:
            send_push_notification(
                token.token,
                'New Booking',
                f'{request.user} has accepted your booking.'
            )
        return Response({"message": "Booking accepted."}, status=status.HTTP_200_OK)

class DeclineBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id, gig_instance__gig__provider=request.user)
        booking.status = Booking.StatusChoices.DECLINED
        booking.save()
        return Response({"message": "Booking declined."}, status=status.HTTP_200_OK)
    

class GigDetailView(APIView):
    """
    Retrieve a gig with all its instances.
    """

    def get(self, request, pk, format=None):
        gig = get_object_or_404(Gig, pk=pk)

        serializer = DashboardGigInstanceSerializer(gig)
        print(serializer.data)
        return Response(serializer.data)
    
class GigUpdateAPIView(APIView):
    """
    Update a gig instance.
    """
    
    def patch(self, request, pk):
        # Adjust start_time and end_time in the request.data if they exist
        data = request.data.copy()  # Make a mutable copy of the request data

        # Subtract 4 hours from start_time and end_time if present
        for time_field in ['start_time', 'end_time']:
            if time_field in data:
                original_time = datetime.strptime(data[time_field], '%H:%M:%S').time()
                adjusted_time = (datetime.combine(datetime.today(), original_time) - timedelta(hours=4)).time()
                data[time_field] = adjusted_time.strftime('%H:%M:%S')

        gig = get_object_or_404(GigInstance, pk=pk)
        serializer = GigInstanceSerializer(gig, data=data, partial=True)  # partial=True allows for partial updates

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)