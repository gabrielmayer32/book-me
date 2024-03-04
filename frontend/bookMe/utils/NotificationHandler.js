// NotificationHandler.js
import React, { useEffect, useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { useUser } from '../src/UserContext'; // Adjust the path as necessary
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const NotificationHandler = () => {
  const { incrementNotificationCount } = useUser();

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received !!!');
      // const data = notification.request.content.data; // Correctly access the notification data
      incrementNotificationCount();
      // if (data.targetScreen === 'GigDetail') {
      //   // Ensure you have the correct parameters for navigation
      //   navigation.navigate('GigDetail', { id: data.id });
      // } else if (data.targetScreen === 'Home') {
      //   navigation.navigate('Home'); // Correct navigation to 'Home' instead of 'ProfileDetails' unless intended
      // }
    });

    return () => Notifications.removeNotificationSubscription(subscription);
  }, [incrementNotificationCount]);

  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped, response received!');
      incrementNotificationCount();
    });
  
    return () => Notifications.removeNotificationSubscription(responseListener);
  }, [incrementNotificationCount]);
  

  return null;
};

export default NotificationHandler;
