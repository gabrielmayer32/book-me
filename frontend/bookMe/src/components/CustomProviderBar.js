import React from 'react';
import { Appbar } from 'react-native-paper';

const CustomAppBar = ({ navigation, userInfo, currentScreen }) => {
  
  // Function to navigate to the Profile screen
  const goToProfile = () => {
    navigation.navigate('ProviderDashboard'); // Adjust 'ProfileScreen' as needed
  };

  // Function to navigate to the Calendar screen
  const goToCalendar = () => {
    navigation.navigate('ProviderGigs');
  };

  // Function to navigate to the Notifications screen
  const goToNotifications = () => {
    navigation.navigate('NotificationsScreen', { userInfo }); // Adjust 'NotificationsScreen' as needed
  };

  return (
    <Appbar.Header>
      <Appbar.Content title="Dashboard" />
      <Appbar.Action     

        icon="account-circle" 
        onPress={goToProfile} 
        color={currentScreen === 'ProviderDashboard' ? '#4A90E2' : 'black'}
      />
      <Appbar.Action 
        icon="calendar" 
        onPress={goToCalendar} 
        color={currentScreen === 'ProviderGigs' ? '#4A90E2' : 'black'}
      />
      <Appbar.Action 
        icon="bell" 
        onPress={goToNotifications} 
        color={currentScreen === 'NotificationsScreen' ? '#4A90E2' : 'black'}
      />
    </Appbar.Header>
  );
};

export default CustomAppBar;
