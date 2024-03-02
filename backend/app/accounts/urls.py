from django.urls import path
from .views import ActivityCollaboratorsView, ActivityList, login_view, receive_expo_push_token, service_providers_list

urlpatterns = [
    path('providers/', service_providers_list, name='service-providers-list'),
    path('login/', login_view, name='login'),
    path('activities/', ActivityList.as_view(), name='activity-list'),
    path('activities/<int:activity_id>/collaborators/', ActivityCollaboratorsView.as_view(), name='activity-collaborators'),
    path('push/expo-token/', receive_expo_push_token, name='receive_expo_push_token'),

]
