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
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: { backgroundColor: '#4F8EF7' }, // Add this line to set the background color

      })}
    >
<Tab.Screen 
        name="Home" 
        options={{
          title: 'Home',
          headerStyle: { backgroundColor: '#4F8EF7' },
          headerTintColor: 'white',
        }}
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
      <Tab.Screen name="Bookings" 
      options={{
        title: 'Bookings',
        headerStyle: { backgroundColor: '#4F8EF7' },
        headerTintColor: 'white',
      }}
      component={BookingsScreen} />
      <Tab.Screen
    
          name="Notifications"
          component={NotificationScreen}
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: '#4F8EF7' },
            headerTintColor: 'white',

            tabBarIcon: ({ focused, color, size }) => (
              <View>
                <Icon name={focused ? 'bell' : 'bell-outline'} size={size} color={color} />
                {notificationCount > 0 && (
                  <Badge style={{ position: 'absolute', top: -6, right: -6, fontSize: 8, width: 1, }}>{notificationCount}</Badge>
                )}
              </View>
            ),
          }}
        />

    </Tab.Navigator>
  );
}



export default AppTabs;

