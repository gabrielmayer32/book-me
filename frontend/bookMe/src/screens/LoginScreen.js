// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import {useUser} from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [isProvider, setIsProvider] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUserInfo } = useUser(); 

const handleLogin = async () => {
    
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
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
        console.log(result)
        navigation.navigate(result.user.isProvider ? 'ProviderDashboard' : 'HomeTabs');
        
      } else  {
        // Handle login failure
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
