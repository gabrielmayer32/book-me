import React, { useState } from 'react';
import { View, StyleSheet,Modal, TouchableOpacity, Text, ScrollView } from 'react-native';

import { Button, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomSignupBar from '../components/CustomSignupBar';
import ScreenLayout from '../components/ScreenLayout';
import {BACKEND_URL} from '../../utils/constants/';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import  Theme from '../theme/theme';
import CountryPicker from 'react-native-country-picker-modal';
import { KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Importing a modal date picker for better control


const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthdate: new Date(),
    phoneNumber: '',
    country: '',
    countryCode: '',
    password: '',
    confirmPassword: '',

  });
  const [errors, setErrors] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [date, setDate] = useState(new Date());

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  console.log(regex.test("G7885984g.")); // Expected output: true

    if (!formData.firstName.match(/^[A-Za-z]+$/)) {
      newErrors.firstName = 'First name must contain only letters.';
      isValid = false;
    }

    if (!formData.lastName.match(/^[A-Za-z]+$/)) {
      newErrors.lastName = 'Last name must contain only letters.';
      isValid = false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email.';
      isValid = false;
    }
    if (!formData.countryCode) {
      newErrors.countryCode = 'Please select a country.';
      isValid = false;
    }
    if (!formData.phoneNumber.match(/^\+\d+$/)) {
      newErrors.phoneNumber = 'Please enter a valid phone number with country code.';
      isValid = false;
    }

    
    // Check if birthdate is not selected
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required.';
      isValid = false;
    }

   
  
    // Ensure the birthdate is selected and in the past
    if (!formData.birthdate || formData.birthdate >= new Date()) {
      newErrors.birthdate = 'Birthdate must be in the past.';
      isValid = false;
    }
  
    if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*,?&.]).{8,}$/)) {
      console.log("Password validation failed:", formData.password);
      newErrors.password = 'Password must include at least 8 characters, a number, an uppercase letter, a lowercase letter, and a special character.';
      isValid = false;
    }
  
  
    console.log("Validating phone number:", formData.phoneNumber);
console.log("Validating password:", formData.password);


    setErrors(newErrors);
    return isValid;
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleConfirmDate = (date) => {
    setFormData({ ...formData, birthdate: date });
    setDatePickerVisibility(false);
  };

  // Show or hide the date picker based on current state
  const toggleDatePicker = () => {
    setDatePickerVisibility(!isDatePickerVisible);
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setErrors({}); // Clear errors before attempting signup again

    const csrfToken = await AsyncStorage.getItem("csrfToken");
    try {
      const response = await fetch(`${BACKEND_URL}/accounts/register/`, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          birthdate: formData.birthdate.toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
          phone_number: formData.phoneNumber,
          password: formData.password,
          is_provider: false, // Assuming default user is not a provider
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log('Signup successful', data);
        Alert.alert('Signup Successful', 'You can now login with your credentials.');
        navigation.navigate('Login');
      } else {
        console.error('Signup failed', data);
        Alert.alert('Signup Failed', 'Please check your input and try again.');
      }
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert('Signup Error', 'An unexpected error occurred. Please try again later.');
    }
  };
  
  const onSelectCountry = (country) => {
    setFormData({
      ...formData,
      country: country.name,
      countryCode: country.cca2,
      phoneNumber: `+${country.callingCode[0]}` + formData.phoneNumber.replace(/^\+\d+/, ''), // Keep user input while replacing previous country code
    });
  };

  
  

  return (
    <LinearGradient
      colors={['#424874', '#517193', '#7298ac', '#a0bfc4', '#d6e5e3']}
      style={styles.gradient}
    >
      <ScreenLayout title="Signup" showBackButton={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <ScrollView>
            <CustomSignupBar
              navigation={navigation}
              currentScreen="ProviderGigs" // Adjust this value based on the current screen
            />
    <View style={styles.container}>
  <TextInput
    label="First Name *"
    value={formData.firstName}
    onChangeText={text => setFormData({ ...formData, firstName: text })}
    mode="outlined"
    style={styles.input}
    error={!!errors.firstName}
  />
  {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

  {/* Last Name Input */}
  <TextInput
    label="Last Name *"
    value={formData.lastName}
    onChangeText={text => setFormData({ ...formData, lastName: text })}
    mode="outlined"
    style={styles.input}
    error={!!errors.lastName}
  />
  {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

  {/* Email Input */}
  <TextInput
    label="Email *"
    value={formData.email}
    onChangeText={text => setFormData({ ...formData, email: text })}
    mode="outlined"
    style={styles.input}
    error={!!errors.email}
  />
  {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

  {/* Phone Number Input */}
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <CountryPicker
    withFlag
    withCallingCode
    withFilter
    withAlphaFilter
    onSelect={onSelectCountry}
    countryCode={formData.countryCode}
    containerButtonStyle={errors.countryCode ? styles.errorBorder : {}}
  />
  <TextInput
    label="Phone *"
    value={formData.phoneNumber}
    onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
    mode="outlined"
    style={{ flex: 1, marginLeft: 10 }}
    error={!!errors.phoneNumber}
  />
  </View>
  {!!errors.countryCode && <Text style={styles.errorText}>{errors.countryCode}</Text>}

  {/* Password Input */}
  <TextInput
    label="Password *"
    value={formData.password}
    onChangeText={text => setFormData({ ...formData, password: text })}
    secureTextEntry
    mode="outlined"
    style={styles.input}
    error={!!errors.password}
  />
  {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
  {/* Confirm Password Input */}
<TextInput
  label="Confirm Password *"
  value={formData.confirmPassword}
  onChangeText={text => setFormData({ ...formData, confirmPassword: text })}
  secureTextEntry
  mode="outlined"
  style={styles.input}
  error={!!errors.confirmPassword}
/>
{!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}


<TouchableOpacity onPress={toggleDatePicker} style={styles.datePickerButton}>
            <Text style={styles.datePickerButtonText}>Select Birthdate</Text>
          </TouchableOpacity>
          
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={toggleDatePicker}
          />

          {/* Display selected date */}
          {formData.birthdate ? <Text> {formData.birthdate.toDateString()}</Text> : null}


        {/* Signup Button */}
        <Button mode="contained" onPress={handleSignup} style={styles.signupButton}>Sign Up</Button>
        <Button mode="contained" onPress={handleBackToLogin} style={styles.signupButton}>Back to log in</Button>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  </LinearGradient>
);
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  errorText: {
    color: 'black',
    marginRight:100,
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Vertically center
    alignItems: 'center', // Horizontally center
    padding: 20,
  },
  datePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
    height: 40,
    width: '100%', // Take the full width of the container
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  datePickerTrigger: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    width: '60%', // Adjust width as needed
  },
  datePickerText: {
    color: 'black',
  },
  signupButton: {
    marginTop: 10,
    width: '100%', // Button should take full width of its container
  },
  forgotPasswordButton: {
    alignSelf: 'center', // Aligns the touchable to the center
    marginTop: 5,
  },
  forgotPasswordText: {
    color: 'black',
    fontSize: 14,
  },
});

export default SignupScreen;