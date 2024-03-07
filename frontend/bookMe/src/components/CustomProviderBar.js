import React from 'react';
import { Appbar, Badge } from 'react-native-paper'; 
import { View, Text, Image, Alert, StyleSheet, FlatList,ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../UserContext';
import LogoutButton from '../components/LogoutButton'; // Adjust with your actual logout button component path

const CustomAppBar = ({ navigation, notificationCount, currentScreen }) => {
  const { userInfo, resetNotificationCount } = useUser();
  const goToProfile = () => {
    navigation.navigate('ProviderDashboard'); // Adjust 'ProfileScreen' as needed
  };

  const goToCalendar = () => {
    navigation.navigate('ProviderGigs');
  };

  const goToNotifications = () => {
    navigation.navigate('ProviderNotificationScreen', { userInfo }); 
  };

  return (
    <Appbar.Header>
      <Appbar.Content title="Dashboard" />
      <Appbar.Action icon="account-circle" size={30}   onPress={goToProfile} color={currentScreen === 'ProviderDashboard' ? '#4A90E2' : 'black'} />
      <Appbar.Action icon="calendar"  size={30} onPress={goToCalendar} color={currentScreen === 'ProviderGigs' ? '#4A90E2' : 'black'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <Appbar.Action icon="bell" size={30}  onPress={goToNotifications} color={currentScreen === 'ProviderNotificationsScreen' ? '#4A90E2' : 'black'} />
        {notificationCount > 0 && (
          <Badge style={{ position: 'absolute', top: -1, right: -1 }}>{notificationCount}</Badge>
        )}
      <LogoutButton navigation={navigation}/> 

      </View>
    </Appbar.Header>
  );
};

export default CustomAppBar;
