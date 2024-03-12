// In App.js
import React, { useEffect, useContext, useRef, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator'; // Assuming you have a navigator
import { UserProvider } from './src/UserContext';
import * as Notifications from 'expo-notifications';
import { Text, View, Button, Platform } from 'react-native';
import { Snackbar } from 'react-native-paper';
import NotificationHandler from './utils/NotificationHandler';
import { Linking } from 'react-native';
import snackbarManager from './utils/snackbarManager';
import * as Device from 'expo-device';
import { SubscriptionProvider } from './src/SubscriptionContext'; 
import { UserContext } from './src/UserContext'; // Adjust the path as necessary
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";




const App = () => {
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');


  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      setSnackbarMessage(`${title}: ${body}`);
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

  
  
  // useEffect(() => {
  //   registerForPushNotificationsAsync();
  // }, []);


  useEffect(() => {
    snackbarManager.setSnackbar((message) => {
      setSnackbarMessage(message);
      setVisible(true);
    });
  }, []);



  const onDismissSnackBar = () => setVisible(false);


  return (
    <PaperProvider theme={Theme}>
      <UserProvider>
      <SubscriptionProvider>
        <NotificationHandler />
        <AppNavigator />
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          duration={3000}>
        {snackbarMessage}
        </Snackbar>
        </SubscriptionProvider>
      </UserProvider>
    </PaperProvider>
  );
};

export default App;
