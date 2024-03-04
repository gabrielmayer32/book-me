// In App.js
import React, { useEffect, useContext, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator'; // Assuming you have a navigator
import { UserProvider } from './src/UserContext';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import NotificationHandler from './utils/NotificationHandler';
import { Linking } from 'react-native';

import { UserContext } from './src/UserContext'; // Adjust the path as necessary

const App = () => {
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      setSnackMessage(`${title}: ${body}`);
      setVisible(true); // Show the snackbar
    });

    return () => Notifications.removeNotificationSubscription(subscription);
  }, []);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = new URL(event.url);
      const pathName = url.pathname;
      const queryParams = new URLSearchParams(url.search);
      const id = queryParams.get('id');
    
      if (pathName === '/gig/') {
        // Assume `navigation` is available via useNavigation or similar
        // navigation.navigate('GigDetail', { id });
      }
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => Linking.removeEventListener('url', handleDeepLink);
  }, []);

  async function registerForPushNotificationsAsync() {
    let { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
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
  }
  
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const onDismissSnackBar = () => setVisible(false);

  return (
    <PaperProvider theme={Theme}>
      <UserProvider>
        <NotificationHandler />
        <AppNavigator />
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          duration={3000}>
          {snackMessage}
        </Snackbar>
      </UserProvider>
    </PaperProvider>
  );
};

export default App;
