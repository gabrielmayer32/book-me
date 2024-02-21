from django.shortcuts import get_object_or_404
from accounts.models import CustomUser  # Or your custom user model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Gig
from .serializers import GigSerializer


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
import googlemaps

class UpcomingGigsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        provider_id = kwargs.get('provider_id')
        User = get_user_model()
        provider = get_object_or_404(User, pk=provider_id)

        today = datetime.today().date()
        three_months_later = today + timedelta(days=90)

        gigs = GigInstance.objects.filter(gig__provider=provider, date__range=[today, three_months_later], is_booked=False).order_by('date', 'start_time')

        # Initialize Google Maps client
        gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)  # Make sure to store your API key securely

        gigs_data = []
        for gig in gigs:
            location = {'lat': gig.gig.latitude, 'lng': gig.gig.longitude}
            # Fetch address from Google Maps
            reverse_geocode_result = gmaps.reverse_geocode(location)
            address = reverse_geocode_result[0]['formatted_address'] if reverse_geocode_result else None

            gigs_data.append({
                'id': gig.id,
                'title': gig.gig.title,
                'description': gig.gig.description,
                'date': gig.date,
                'start_time': gig.start_time,
                'end_time': gig.end_time,
                'is_booked': gig.is_booked,
                'remaining_slots': gig.remaining_slots,
                'latitude': gig.gig.latitude,
                'longitude': gig.gig.longitude,
                'address': address,
            })

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
