from django.urls import path
from .views import CreateGigView, ProviderGigsView, UpcomingGigsView
urlpatterns = [
    path('get/', ProviderGigsView.as_view(), name='provider-gigs'),
    path('create/', CreateGigView.as_view(), name='create-gig'),
    path('provider/<int:provider_id>/upcoming-gigs/', UpcomingGigsView.as_view(), name='upcoming-gigs'),

]
