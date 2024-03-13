// screens/LoginScreen.js
import React, { useEffect, useContext, useRef, useState } from 'react';
import { View, Text,  Image, StyleSheet, TouchableOpacity } from 'react-native';
import HomeScreen from './HomeScreen';
import {useUser} from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {BACKEND_URL} from '../../utils/constants/';
import {Button, TextInput} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import  Theme from '../theme/theme';
import {  Platform } from 'react-native';
import { Switch } from 'react-native';

import * as Device from 'expo-device';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '417222620085-sck91bphem0d4cfa95gf95gl01rd0l6k.apps.googleusercontent.com',
  iosClientId: '417222620085-rc6v0legpp1i3r7ep5e0kaje9alamdrn.apps.googleusercontent.com',
  offlineAccess: true,
  offlineAccess: true,
  forceCodeForRefreshToken: true,


});
console.log('Google Signin configured');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();  
  const { setUserInfo, fetchNotificationsCount } = useUser();
  const [user, setUser] = useState(null);

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      const storedCredentials = await AsyncStorage.getItem('credentials');
      if (storedCredentials) {
        const { username, password } = JSON.parse(storedCredentials);
        setUsername(username);
        setPassword(password);
        setRememberMe(true); // Automatically toggle Remember Me if credentials are stored
      }
    };
  
    loadCredentials();
  }, []);
  

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleLogin = async () => {
    try {
      let token = await registerForPushNotificationsAsync();
      console.log(token);
      // AsyncStorage.setItem('expoPushToken', token);
      // const expoPushToken = await AsyncStorage.getItem('expoPushToken');
      // console.log(expoPushToken);
      
      const response = await fetch(`${BACKEND_URL}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      });
      const csrfToken = response.headers.get('set-cookie').split(';')[0].split('=')[1];
      
      if (csrfToken){
        await AsyncStorage.setItem('csrfToken', csrfToken);
      }
  
      const result = await response.json();
      if (result.success && result.user) {
        if (rememberMe) {
          await AsyncStorage.setItem('credentials', JSON.stringify({ username, password }));
        } else {
          // Ensure any existing saved credentials are cleared if Remember Me is not selected
          await AsyncStorage.removeItem('credentials');
        }
        setUserInfo(result.user);
        fetchNotificationsCount(); // Fetch notifications count right after setting user info
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

  // async function registerForPushNotificationsAsync() {
  //   let token;
  //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //   let finalStatus = existingStatus;
  //   if (existingStatus !== 'granted') {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     finalStatus = status;
  //   }
  //   if (finalStatus !== 'granted') {
  //     alert('Failed to get push token for push notification!');
  //     return;
  //   }
  //   token = (await Notifications.getExpoPushTokenAsync({
  //     projectId: 'cab1a67b-dd94-4b1f-a03a-121ab6e4007e',
  //  })).data;
  //   console.log(token);
  //   return token;
  // }

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
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
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (await Notifications.getExpoPushTokenAsync({ projectId: 'cab1a67b-dd94-4b1f-a03a-121ab6e4007e',})).data;
      console.log(token);
    } else {
      // alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }
  
  // Function to send the Expo Push Token to your backend
  async function sendExpoPushToken(token, userId) {
    console.log('TOKEN')
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



  const handleGoogleSignIn = async () => {
    try {
      console.log('Google Sign In');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const userToken = await GoogleSignin.getTokens();
      console.log(userInfo);
  
      if (!userInfo) {
        console.error('Google Sign-In failed: userInfo is undefined.');
        return; // Exit the function if userInfo is undefined
      }
  
      // Proceed with using userInfo.idToken as before
      const { idToken } = userInfo;
      console.log(idToken);
      let token = await registerForPushNotificationsAsync();
      console.log(token);
      if (token) {
        await AsyncStorage.setItem('expoPushToken', token);
      }
  
      // Send the idToken to your backend
      const response = await fetch(`${BACKEND_URL}/accounts/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      const csrfToken = response.headers.get('set-cookie').split(';')[0].split('=')[1];
      await AsyncStorage.setItem('csrfToken', csrfToken);

  
      const result = await response.json();
      console.log(result);
      if (result.success && result.user) {
        setUserInfo(result.user); // Set userInfo in global context
        fetchNotificationsCount(); // Fetch notifications count right after setting user info
        
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
        // Handle authentication failure here
        console.error("Authentication failed", result.message);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log(error)
          // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log(error)
          // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log(error)
          // play services not available or outdated
      } else {
          console.log(error)
          // some other error happened
      }
  }
};
  
  
  
  
  return (
    <LinearGradient
    colors={['#424874', '#517193', '#7298ac', '#a0bfc4', '#d6e5e3']}
    style={styles.gradient}
    >
    <View style={styles.container}>


      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.inputContainer}>

      <TextInput
  label="Username"
  value={username}
  onChangeText={setUsername}
  mode="outlined"
  theme={{ colors: { primary: 'blue', underlineColor: 'transparent', background: 'white' } }}
  style={styles.input}
/>

        <TextInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#4F8EF7', underlineColor: 'transparent', } }}
        />
                   <View style={styles.actionRow}>
  <View style={styles.rememberMeContainer}>
    <Text style={styles.rememberMeText}>Remember Me</Text>
    <Switch
      value={rememberMe}
      onValueChange={setRememberMe}
      color="#4F8EF7"
      style={styles.rememberMeSwitch}
    />
  </View>
  <TouchableOpacity 
    onPress={() => navigation.navigate('ForgotPassword')} // Adjust navigation as needed
    style={styles.forgotPasswordButton}
  >
    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
  </TouchableOpacity>
</View>

</View>

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Signup')} style={styles.button}>
        Sign Up
      </Button>
      <Button icon="google" mode="outlined" onPress={handleGoogleSignIn} style={styles.button}>
        Continue with Google
      </Button>

     
    </View>
    </LinearGradient>


  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10, // Adjust as needed
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginRight: 5, // Space between text and switch
    // Any additional styling for the text
  },
  rememberMeSwitch: {
    transform: [{ scaleX: .8 }, { scaleY: .8 }], // Scale down the switch
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 75,
  },
  gradient: {
    flex: 1,
    width: '100%', // Ensure it covers the full width
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end', // Aligns the touchable to the right
    marginTop: 5,
  },
  forgotPasswordText: {
    color: 'black', // Feel free to adjust the color
    fontSize: 14,
  },
});

export default LoginScreen;