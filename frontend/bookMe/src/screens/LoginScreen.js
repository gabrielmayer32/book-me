// screens/LoginScreen.js
import React, { useState , useEffect} from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import {useUser} from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {BACKEND_URL} from '../../utils/constants/';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUserInfo } = useUser(); 

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => AsyncStorage.setItem('expoPushToken', token));
  }, []);
  const handleLogin = async () => {
    try {
      // Retrieve the Expo push token from AsyncStorage
      const expoPushToken = await AsyncStorage.getItem('expoPushToken');
  
      const response = await fetch(`${BACKEND_URL}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      });
      const csrfToken = response.headers.get('set-cookie').split(';')[0].split('=')[1];
      await AsyncStorage.setItem('csrfToken', csrfToken);
  
      const result = await response.json();
      if (result.success && result.user) {
        setUserInfo(result.user); // Set userInfo in global context
  
        // Ensure the expoPushToken is not null or undefined before attempting to send it
        if (expoPushToken) {
          await sendExpoPushToken(expoPushToken, result.user.id);
        } else {
          console.error("Expo Push Token is not available.");
        }
  
        navigation.reset({
          index: 0,
          routes: [{ name: result.user.isProvider ? 'ProviderDashboard' : 'HomeTabs' }],
        });  
      } else {
        // Handle login failure
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'cab1a67b-dd94-4b1f-a03a-121ab6e4007e',
   })).data;
    console.log(token);
    return token;
  }
  
  // Function to send the Expo Push Token to your backend
  async function sendExpoPushToken(token, userId) {
    console.log(token)
    try {
      // Correct the template literal usage for BACKEND_URL
      await fetch(`${BACKEND_URL}/accounts/push/expo-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          expoPushToken: token,
        }),
      });

    } catch (error) {
      console.error("Error sending Expo Push Token: ", error);
    }
  }
  
  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input} 
      />
      <Button title="Login" onPress={handleLogin} />
      {/* Toggle isProvider for testing */}
      <Button title="Toggle User Type" onPress={() => setIsProvider(!isProvider)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default LoginScreen;
