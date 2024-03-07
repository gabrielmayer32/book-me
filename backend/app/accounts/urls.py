from django.urls import path
from .views import ActivityCollaboratorsView, ActivityList, CreateUserView, DeleteNotificationView, LogoutView, MarkNotificationsAsReadView, NotificationCountView, NotificationsAPIView, google_login, login_view, receive_expo_push_token, service_providers_list
from . import views

urlpatterns = [
    path('providers/', service_providers_list, name='service-providers-list'),
    path('login/', login_view, name='login'),
    path('google-login/', google_login, name='google_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('activities/', ActivityList.as_view(), name='activity-list'),
    path('activities/<int:activity_id>/collaborators/', ActivityCollaboratorsView.as_view(), name='activity-collaborators'),
    path('push/expo-token/', receive_expo_push_token, name='receive_expo_push_token'),
    path('notifications/', NotificationsAPIView.as_view(), name='notifications'),
    path('notifications/delete/<int:pk>/', DeleteNotificationView.as_view(), name='delete-notification'),
    path('notifications/mark-as-read/', MarkNotificationsAsReadView.as_view(), name='mark_notifications_as_read'),
    path('subscribe/<int:provider_id>/', views.toggle_subscription, name='toggle_subscription'),
    path('register/', CreateUserView.as_view(), name='register'),
    path('notifications/count/', NotificationCountView.as_view(), name='notification-count'),

]   
