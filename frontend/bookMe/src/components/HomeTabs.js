import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import BookingsScreen from '../screens/BookingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import HomeStackScreen from './HomeStack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { Badge } from 'react-native-paper';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { userInfo, notificationCount, resetNotificationCount } = useUser();
  const navigation = useNavigation(); // Get access to navigation
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          else if (route.name === 'Notification') iconName = focused ? 'bell' : 'bell-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F8EF7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
<Tab.Screen 
        name="Home" 
        component={HomeStackScreen} 
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
            if (routeName === 'Home' || routeName !== 'Home') {
              navigation.navigate('Home');
            }
          },
        })}
      />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View>
                <Icon name={focused ? 'bell' : 'bell-outline'} size={size} color={color} />
                {notificationCount > 0 && (
                  <Badge style={{ position: 'absolute', top: 0, right: -6 }}>{notificationCount}</Badge>
                )}
              </View>
            ),
          }}
        />

    </Tab.Navigator>
  );
}

export default AppTabs;