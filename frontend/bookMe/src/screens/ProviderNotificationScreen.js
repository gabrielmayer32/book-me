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
import PackageSubscriptionItem from '../components/PackageRequestItem';

const PackageSubscriptionRequests = ({ navigation, userInfo }) => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const { resetNotificationCount } = useUser();
  const fetchPendingPackageSubscriptions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/accounts/pending-package-subscriptions/`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });
      setPendingSubscriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch pending package subscriptions:', error);
      Alert.alert('Error', 'Failed to fetch pending package subscriptions.');
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.id) {
      resetNotificationCount();
      fetchPendingPackageSubscriptions();
    }
  }, [userInfo]);


const handleAcceptSubscription = async (subscriptionId) => {
  console.log('ok');
  try {
    const csrfToken = await AsyncStorage.getItem("csrfToken"); // Assuming CSRF token storage
    const response = await fetch(`${BACKEND_URL}/accounts/accept-subscription/${subscriptionId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": csrfToken, // Include CSRF token if required
        // Include Authorization header if your API requires authentication
      },
    });

    if (!response.ok) {
      throw new Error('Failed to accept subscription');
    }

    const data = await response.json();
    fetchPendingPackageSubscriptions(); // Refresh the subscriptions list
    alert("Subscription accepted successfully!");
    // fetchSubscriptions(); // Refresh the list of subscriptions
  } catch (error) {
    console.error('Error accepting subscription:', error);
    alert("Error accepting subscription.");
  }
};

const handleDeclineSubscription = async (subscriptionId) => {
  try {
    const csrfToken = await AsyncStorage.getItem("csrfToken"); // Assuming CSRF token storage
    const response = await fetch(`${BACKEND_URL}/accounts/decline-subscription/${subscriptionId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": csrfToken, // Include CSRF token if required
        // Include Authorization header if your API requires authentication
      },
    });

    if (!response.ok) {
      throw new Error('Failed to decline subscription');
    }

    const data = await response.json();
    fetchPendingPackageSubscriptions(); // Refresh the subscriptions list
    alert("Subscription declined successfully!");
    // fetchSubscriptions(); // Refresh the list of subscriptions
  } catch (error) {
    console.error('Error declining subscription:', error);
    alert("Error declining subscription.");
  }
};



  return (
    <View >
      <Text style={styles.title}>Pending Package Subscriptions</Text>
      {pendingSubscriptions.length > 0 ? (
        <FlatList
          data={pendingSubscriptions}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PackageSubscriptionItem
              subscription={item}
              handleAcceptSubscription={() => handleAcceptSubscription(item.id)}
              handleDeclineSubscription={() => handleDeclineSubscription(item.id)}
            />
          )}
        />
      ) : (
        <Text>No pending package subscriptions found.</Text>
      )}
    </View>
  );
};



const ProviderNotificationScreen = ({ navigation }) => {
    const { userInfo, resetNotificationCount ,  decrementNotificationCount} = useUser();
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
            fetchBookingRequests();
            decrementNotificationCount();
            navigation.navigate('ProviderDashboard');
        } catch (error) {
            console.error('Failed to accept booking:', error);
            Alert.alert('Error', 'Failed to accept booking.');
        }
    };
  
    const handleDeclineBooking = async (bookingId) => {
        try {
          const csrfToken = await AsyncStorage.getItem('csrfToken');
            await axios.post(`${BACKEND_URL}/gig/decline-booking/${bookingId}/`, 
            { status: 'declined' }, 
            { headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            } }); // Replace with your token
            decrementNotificationCount();
            fetchBookingRequests();
            navigation.navigate('ProviderDashboard');
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
        <PackageSubscriptionRequests navigation={navigation} userInfo={userInfo} />
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
    title: {
      fontSize: 16,
      marginTop: 10,
      marginBottom: 20,
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
  