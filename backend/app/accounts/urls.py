from django.urls import path

from .views import unsubscribe_user
from .views import AcceptPackageSubscriptionView, ActivityCollaboratorsView, ActivityList,  CreateUserView, DeclinePackageSubscriptionView, DeleteNotificationView, LogoutView, MarkNotificationsAsReadView, NotificationCountView, NotificationsAPIView, PackageList, ProviderPackagesList, UserPackageSubscriptionsView, check_subscription,   create_subscription, delete_package, get_payment_info, google_login, login_view, pending_package_subscriptions, receive_expo_push_token, service_providers_list, update_package
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

    path('create_package/', views.create_package, name='create_package'),
    path('update_package/<int:package_id>/', update_package, name='update_package'),
    path('delete_package/<int:package_id>/', delete_package, name='delete_package'),

    path('package/list/', PackageList.as_view(), name='package_list'),
    path('packages/provider/<int:providerId>/', ProviderPackagesList.as_view(), name='provider-packages-list'),
    path('payment-info/provider/<int:provider_id>/', get_payment_info, name='get_payment_info'),
    path('packages/subscribe/<int:package_id>/', create_subscription, name='create_subscription'),
    path('check-subscription/', check_subscription, name='check_subscription'),
    path('accept-subscription/<int:subscription_id>/', AcceptPackageSubscriptionView.as_view(), name='accept-subscription'),
    path('decline-subscription/<int:subscription_id>/', DeclinePackageSubscriptionView.as_view(), name='decline-subscription'),
    path('pending-package-subscriptions/', pending_package_subscriptions, name='pending-package-subscriptions'),
    path('check-subscriptions-status/<int:user_id>/', UserPackageSubscriptionsView.as_view(), name='check-subscriptions-status'),
    path('package/unsubscribe/<int:subscription_id>/<int:user_id>/', unsubscribe_user, name='unsubscribe_user'),
]   
