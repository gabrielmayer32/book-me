// In App.js
import React, {useEffect, useState} from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator'; // Assuming you have a navigator
import { UserProvider } from './src/UserContext';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import NotificationHandler from './utils/NotificationHandler';

const App = () => {
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  useEffect(() => {
    // Notification received listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      setSnackMessage(`${title}: ${body}`);
      setVisible(true); // Show the snackbar
    });

    return () => {
      Notifications.removeNotificationSubscription(subscription);
    };
  }, []);

  const onDismissSnackBar = () => setVisible(false);

  async function registerForPushNotificationsAsync() {
    let { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }
  
  useEffect(() => {
    registerForPushNotificationsAsync();

  
  }, []);

  return (
    <PaperProvider theme={Theme}>

      <UserProvider>
        <NotificationHandler />
        <AppNavigator />
      </UserProvider>
    </PaperProvider>
  );
};

export default App;
