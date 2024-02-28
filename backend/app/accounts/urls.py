from django.urls import path
from .views import ActivityCollaboratorsView, ActivityList, login_view, service_providers_list

urlpatterns = [
    path('providers/', service_providers_list, name='service-providers-list'),
    path('login/', login_view, name='login'),
    path('activities/', ActivityList.as_view(), name='activity-list'),
    path('activities/<int:activity_id>/collaborators/', ActivityCollaboratorsView.as_view(), name='activity-collaborators'),
]
