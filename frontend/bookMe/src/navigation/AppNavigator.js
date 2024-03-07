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
import AppTabs from '../components/HomeTabs';
import RecurringGigInstancesScreen from '../screens/RecurringGigInstances';
import ActivityCollaborators from '../screens/ActivityCollaboratorsScreen';
import ProviderNotificationScreen from '../screens/ProviderNotificationScreen';
import { LinkingOptions } from '@react-navigation/native';
import TemplateGigListScreen from '../screens/TemplateGigListScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createStackNavigator();

const linking = {
  // prefixes: ['BookMe://', 'https://yourapp.com'], // Adjust these URLs to match your app's URL schemes
  prefixes: ['BookMe://'], // Adjust these URLs to match your app's URL schemes

  config: {
    screens: {
      GigDetail: 'gig/:id', 
      Home: 'home',
      // Define other paths and screens as needed
    },
  },
};

function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="HomeTabs" component={AppTabs} />
        <Stack.Screen name="RecurringGigInstances" component={RecurringGigInstancesScreen} />
        <Stack.Screen name="ProviderNotificationScreen" component={ProviderNotificationScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailScreen} />
        <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
        <Stack.Screen name="ProviderGigs" component={ProviderGigScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="ActivityCollaborators" component={ActivityCollaborators} />
        <Stack.Screen name="TemplatesScreen" component={TemplateGigListScreen} />
      </Stack.Navigator>
      </NavigationContainer>
  );
}


// function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="HomeTabs" component={AppTabs} />
//         <Stack.Screen name="RecurringGigInstances" component={RecurringGigInstancesScreen} />
    
//         <Stack.Screen name="ProfileDetails" component={ProfileDetailScreen} />
//         <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
//         <Stack.Screen name="ProviderGigs" component={ProviderGigScreen} />
//         <Stack.Screen name="Calendar" component={CalendarScreen} />
//       </Stack.Navigator>
      
//     </NavigationContainer>
//   );
// }


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
