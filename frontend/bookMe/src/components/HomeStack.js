// HomeStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ActivityCollaborators from '../screens/ActivityCollaboratorsScreen';

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeStackHome" component={HomeScreen} />
      <HomeStack.Screen name="ProfileDetails" component={ProfileDetailScreen} />
      <HomeStack.Screen name="Calendar" component={CalendarScreen} />
      <HomeStack.Screen name="ActivityCollaborators" component={ActivityCollaborators} />
    </HomeStack.Navigator>
  );
}

export default HomeStackScreen;
