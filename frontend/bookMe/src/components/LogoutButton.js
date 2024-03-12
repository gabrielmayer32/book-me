// LogoutButton.js
import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BACKEND_URL} from '../../utils/constants/';
import { useUser } from '../UserContext';

const LogoutButton = ({ navigation, color = 'black' }) => {


  const { logoutUser } = useUser();

  const handleLogout = async () => {
    try {
      // Optionally: Remove the Expo Push Token from the backend
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      

      // Perform backend logout
      await fetch(`${BACKEND_URL}/accounts/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Include the CSRF token in the request header
          // Include any authentication headers your API requires
        },
      });

      // Clear any stored user info or tokens

      logoutUser(); // Clear user info from context
      // Reset navigation to the Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Logout Failed', 'Unable to logout. Please try again.');
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "Logout", onPress: handleLogout }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogoutPress} style={{ marginLeft:30, marginRight: 5 }}>
      <Icon name="logout" size={20} color={color} />
    </TouchableOpacity>
  );
};

export default LogoutButton;
