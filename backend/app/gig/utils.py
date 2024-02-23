import requests
import googlemaps
from django.conf import settings


import re

def clean_address(address):
    # Pattern matches alphanumeric codes like "H82C+X6" at the start of the string
    pattern = r"^[A-Z0-9]+[+][A-Z0-9]+\s"
    cleaned_address = re.sub(pattern, '', address, count=1)
    return cleaned_address

def fetch_address_from_lat_lng(latitude, longitude):
    print(latitude)
    print(longitude)
    location = {'lat': latitude, 'lng': longitude}
    gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    reverse_geocode_result = gmaps.reverse_geocode(location)
    address = reverse_geocode_result[0]['formatted_address'] if reverse_geocode_result else None
    address = clean_address(address)
    print(address)
    if address:
        return address
    return None
