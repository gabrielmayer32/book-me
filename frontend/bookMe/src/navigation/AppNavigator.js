// Import necessary components from react-navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import ProviderDashboard from '../screens/ProviderDashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProviderGigScreen from '../screens/ProviderGigScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailScreen} />
        <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
        <Stack.Screen name="ProviderGigs" component={ProviderGigScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    
  },
  content: {
    flexGrow: 1,
    paddingBottom: 30,

    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default AppNavigator;
