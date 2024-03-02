// NotificationHandler.js
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useUser } from '../src/UserContext'; // Adjust the path as necessary

const NotificationHandler = () => {
  const { incrementNotificationCount } = useUser();

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      console.log('Notification received !!!');
      incrementNotificationCount();
    });

    return () => Notifications.removeNotificationSubscription(subscription);
  }, [incrementNotificationCount]);

  return null;
};

export default NotificationHandler;
