// NotificationHandler.js
import React, { useEffect, useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { useUser } from '../src/UserContext'; // Adjust the path as necessary
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import * as Calendar from 'expo-calendar';

const NotificationHandler = () => {
  const { incrementNotificationCount } = useUser(); // Assuming you have a context hook for user operations

  // Async function to delete a calendar event
  const deleteCalendarEvent = async (eventId) => {
    console.log(`Attempting to delete calendar event with ID: ${eventId}`);
    try {
      await Calendar.requestCalendarPermissionsAsync(); // Ensure permissions are requested before attempting deletion
      const result = await Calendar.deleteEventAsync(eventId);
      console.log('Calendar event deleted successfully:', result);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  };

  useEffect(() => {
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('Notification received:', notification);
      const data = notification.request.content.data;
      
      // Increment notification count here
      incrementNotificationCount(); // This should update the context state
  
      if (data.action === 'deleteCalendarEvent' && data.eventId) {
        await deleteCalendarEvent(data.eventId);
      }
    });
  
    // No changes needed in this part
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped, response received!');
      const data = response.notification.request.content.data;
      // incrementNotificationCount(); // This might be redundant if you're only incrementing on notification received
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener);
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, [incrementNotificationCount]);
  

  return null;
};

export default NotificationHandler;