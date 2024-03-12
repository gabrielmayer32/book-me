import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // make sure to install this package
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import CustomAppBar from '../components/CustomProviderBar';
import { useUser } from '../UserContext';
import {BACKEND_URL} from '../../utils/constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatePackageScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [duration, setDuration] = useState('');
  const [numberOfBookings, setNumberOfBookings] = useState('');
  const [price, setPrice] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();
  const { userInfo, resetNotificationCount } = useUser();


  const handleSubmit = async () => {
    if (!name || !duration || !numberOfBookings || !price) {
        Alert.alert("Validation", "Please fill all the fields.");
        return;
    }

    try {
        const csrfToken = await AsyncStorage.getItem('csrfToken'); // Retrieve the stored token
        const response = await fetch(`${BACKEND_URL}/accounts/create_package/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken, // Include CSRF token in the request header
            },
            body: JSON.stringify({
                name,
                description,
                duration: parseInt(duration, 10),
                number_of_bookings: parseInt(numberOfBookings, 10),
                price: parseFloat(price)
            })
        });

        if (!response.ok) {
            throw new Error('Something went wrong'); // Here you can handle HTTP error statuses
        }

        const data = await response.json();
        Alert.alert("Package Created", "Your package has been successfully created.");
        navigation.goBack(); // Or navigate to another screen
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to create the package.");
    }
};


  return (
    <>
    <CustomAppBar 
  navigation={navigation} 
  userInfo={userInfo} 
  currentScreen="ProviderPackages" 
  
/>
    <ScreenLayout >
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Package Name"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />

      
      <Text style={styles.label}>Duration (in days)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Duration"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Number of Bookings included in your package</Text>
      <TextInput
        style={styles.input}
        value={numberOfBookings}
        onChangeText={setNumberOfBookings}
        placeholder="Number of Bookings included in your package"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="decimal-pad"
      />

      <View style={styles.buttonContainer}>
        <Button title="Create Package" onPress={handleSubmit} />
      </View>
    </ScrollView>
    </ScreenLayout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  label: {
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default CreatePackageScreen;
