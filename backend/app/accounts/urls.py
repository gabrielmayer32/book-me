from django.urls import path
from .views import login_view, service_providers_list

urlpatterns = [
    path('providers/', service_providers_list, name='service-providers-list'),
    path('login/', login_view, name='login'),

]
