from django.urls import path


from .views import BookGigView, CancelBookingView, CreateGigView, GigDetailView, GigInstancesView, GigUpdateAPIView, ProviderGigsView, ProviderUpcomingGigsView, UpcomingGigsView, UserBookingsView, AcceptBookingView, BookingRequestsView, DeclineBookingView, gig_templates
urlpatterns = [
    path('get/', ProviderGigsView.as_view(), name='provider-gigs'),
    path('create/', CreateGigView.as_view(), name='create-gig'),
    path('provider/<int:provider_id>/upcoming-gigs/', UpcomingGigsView.as_view(), name='upcoming-gigs'),
    path('book/', BookGigView.as_view(), name='book-gig'),
    path('get/<int:pk>/', GigDetailView.as_view(), name='gig-detail'),

    path('bookings/user/<int:user_id>/', UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/cancel/<int:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),
    
    path('booking-requests/', BookingRequestsView.as_view(), name='booking-requests'),
    path('accept-booking/<int:booking_id>/', AcceptBookingView.as_view(), name='accept-booking'),
    path('decline-booking/<int:booking_id>/', DeclineBookingView.as_view(), name='decline-booking'),
    path('provider/<int:provider_id>/dashboard-upcoming-gigs/', ProviderUpcomingGigsView.as_view(), name='upcoming-gigs'),
    path('instances/<int:gig_id>/', GigInstancesView.as_view(), name='gig-instances'),
    path('update/<int:pk>/', GigUpdateAPIView.as_view(), name='gig-update'),
    path('templates/', gig_templates, name='gig-templates'),


]
