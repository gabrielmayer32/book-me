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
import LogoutButton from '../components/LogoutButton'; // Adjust with your actual logout button component path
import Theme from '../theme/theme';

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
        tabBarStyle: { backgroundColor: Theme.colors.primary , paddingHorizontal: 10, paddingVertical: 5,},


      })}
    >
<Tab.Screen 
        name="Home" 
        options={{
          title: 'Home',
          headerRight: () => <LogoutButton navigation={navigation} color="white" />,
          headerStyle: { backgroundColor: Theme.colors.primary },
          headerTintColor: 'white',
              headerTitleAlign: 'center', // Add this line

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
        headerRight: () => <LogoutButton navigation={navigation} color="white" />,
        headerStyle: { backgroundColor: Theme.colors.primary },
        headerTintColor: 'white',
    headerTitleAlign: 'center', // Add this line

      }}
      component={BookingsScreen} />
      <Tab.Screen
    
          name="Notifications"
          component={NotificationScreen}
          options={{
            title: 'Notifications',
            headerRight: () => <LogoutButton navigation={navigation} color="white"/>,
            headerStyle: { backgroundColor: Theme.colors.primary },
            headerTintColor: 'white',
    headerTitleAlign: 'center', // Add this line

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

