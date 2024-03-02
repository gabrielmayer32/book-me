import React from 'react';
import { Appbar, Badge } from 'react-native-paper'; 
import { View, Text, Image, Alert, StyleSheet, FlatList,ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../UserContext';
const CustomAppBar = ({ navigation, notificationCount, currentScreen }) => {
  const { userInfo, resetNotificationCount } = useUser();
  const goToProfile = () => {
    navigation.navigate('ProviderDashboard'); // Adjust 'ProfileScreen' as needed
  };

  const goToCalendar = () => {
    navigation.navigate('ProviderGigs');
  };

  const goToNotifications = () => {
    resetNotificationCount(); 
    navigation.navigate('ProviderNotificationScreen', { userInfo }); 
  };

  return (
    <Appbar.Header>
      <Appbar.Content title="Dashboard" />
      <Appbar.Action icon="account-circle" onPress={goToProfile} color={currentScreen === 'ProviderDashboard' ? '#4A90E2' : 'black'} />
      <Appbar.Action icon="calendar" onPress={goToCalendar} color={currentScreen === 'ProviderGigs' ? '#4A90E2' : 'black'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <Appbar.Action icon="bell" onPress={goToNotifications} color={currentScreen === 'ProviderNotificationsScreen' ? '#4A90E2' : 'black'} />
        {notificationCount > 0 && (
          <Badge style={{ position: 'absolute', top: -1, right: -1 }}>{notificationCount}</Badge>
        )}
      </View>
    </Appbar.Header>
  );
};

export default CustomAppBar;
