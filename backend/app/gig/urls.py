from django.urls import path
from .views import BookGigView, CancelBookingView, CreateGigView, ProviderGigsView, UpcomingGigsView, UserBookingsView
urlpatterns = [
    path('get/', ProviderGigsView.as_view(), name='provider-gigs'),
    path('create/', CreateGigView.as_view(), name='create-gig'),
    path('provider/<int:provider_id>/upcoming-gigs/', UpcomingGigsView.as_view(), name='upcoming-gigs'),
    path('book/', BookGigView.as_view(), name='book-gig'),

    path('bookings/user/<int:user_id>/', UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/cancel/<int:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),

]
