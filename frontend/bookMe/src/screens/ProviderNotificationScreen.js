import React , { Linking,useEffect, useState }from 'react';
import { Appbar, Badge } from 'react-native-paper'; 
import { View, Text, Image, Alert, StyleSheet, FlatList,ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../UserContext';
import ScreenLayout from '../components/ScreenLayout';
import axios from 'axios';
import CustomAppBar from '../components/CustomProviderBar';
import BookingRequestItem from '../components/BookingRequestItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BACKEND_URL} from '../../utils/constants/';
const ProviderNotificationScreen = ({ navigation }) => {
    const { userInfo, resetNotificationCount } = useUser();
    const [bookingRequests, setBookingRequests] = useState([]);
  
    useEffect(() => {
      // Assuming userInfo is available and contains an `id`
      if (userInfo && userInfo.id) {
        fetchBookingRequests();
      }
    }, [userInfo]);
  
    const fetchBookingRequests = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/gig/booking-requests/`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('YOUR_TOKEN_HERE')}`, // Adjust token retrieval
          },
        });
        // Adjust booking requests data as necessary
        setBookingRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch booking requests:', error);
        Alert.alert('Error', 'Failed to fetch booking requests.');
      }
    };
  
    const handleAcceptBooking = async (bookingId) => {
        try {
          const csrfToken = await AsyncStorage.getItem('csrfToken');
  
            await axios.post(`${BACKEND_URL}/gig/accept-booking/${bookingId}/`, 
            { status: 'accepted' }, 
            { headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            } }); // Replace with your token
            Alert.alert('Success', 'Booking accepted.');
            fetchBookingRequests();
            navigation.navigate('ProviderDashboard');
        } catch (error) {
            console.error('Failed to accept booking:', error);
            Alert.alert('Error', 'Failed to accept booking.');
        }
    };
  
    const handleDeclineBooking = async (bookingId) => {
        try {
          const csrfToken = await AsyncStorage.getItem('csrfToken');
            await axios.patch(`${BACKEND_URL}/gig/decling-booking/${bookingId}/`, 
            { status: 'declined' }, 
            { headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            } }); // Replace with your token
            Alert.alert('Success', 'Booking declined.');
            // Optionally refresh the booking requests list
        } catch (error) {
            console.error('Failed to decline booking:', error);
            Alert.alert('Error', 'Failed to decline booking.');
        }
    };
    
  
    return (
        <>
        <CustomAppBar 
      navigation={navigation} 
      userInfo={userInfo} 
      currentScreen="ProviderNotificationsScreen" 
      
    />
        <ScreenLayout >
            

      <View style={styles.container}>
        <Text style={styles.upcomingGigsTitle}>Booking Requests</Text>
        {bookingRequests.length > 0 ? (
          <FlatList
            data={bookingRequests}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <BookingRequestItem
                request={item}
                handleAcceptBooking={() => handleAcceptBooking(item.id)}
                handleDeclineBooking={() => handleDeclineBooking(item.id)}
              />
            )}
          />
        ) : (
          <Text style={styles.noGigsText}>No booking requests found.</Text>
        )}
      </View>
    </ScreenLayout>
    </>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    upcomingGigsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    noGigsText: {
      fontSize: 16,
      color: 'gray',
      marginTop: 20,
      textAlign: 'center',
    },
    // Add more styles as needed
  });
  
  export default ProviderNotificationScreen;
  