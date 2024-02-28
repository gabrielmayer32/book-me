import React , { Linking,useEffect, useState }from 'react';
import { View, Text, Image, Alert, StyleSheet, FlatList,ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../components/ScreenLayout';
import { Appbar } from 'react-native-paper';
import CustomAppBar from '../components/CustomProviderBar';
import { useUser } from '../UserContext';
import axios from 'axios';
import BookingRequestItem from '../components/BookingRequestItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GigItem from '../components/GigItem';
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from '../../utils/utcTime';

const ProviderDashboardScreen = ({ route, navigation }) => {
    const { userInfo } = useUser();
    const [upcomingGigs, setUpcomingGigs] = useState([]); // Placeholder state for upcoming gigs
    const [bookingRequests, setBookingRequests] = useState([]);

    useEffect(() => {
      console.log(userInfo)
      fetchUpcomingGigs(userInfo.id);
      fetchBookingRequests();
  }, []);

  const fetchUpcomingGigs = async (providerId) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/gig/provider/${providerId}/dashboard-upcoming-gigs/`, {
            headers: {
            },
        });
        console.log(response.data);
        const adjustedGigs = response.data.map(gig => ({
          ...gig,
          date: gig.date ? adjustDateTimeToUTC4(gig.date).format('YYYY-MM-DD') : gig.date,
          start_time: gig.start_time ? adjustTimeToUTC4(gig.start_time).format("HH:mm") : gig.start_time,
          end_time: gig.end_time ? adjustTimeToUTC4(gig.end_time).format("HH:mm") : gig.end_time,
        }));
        setUpcomingGigs(adjustedGigs);
    } catch (error) {
        console.error('Failed to fetch booking requests:', error);
        Alert.alert('Error', 'Failed to fetch booking requests.');
    }
};

const fetchBookingRequests = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/gig/booking-requests/', {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE', // Replace with your token
      },
    });
    const adjustedGigs = response.data.map(booking => ({
      ...booking,
      gig_instance_details: {
        ...booking.gig_instance_details,
        date: adjustDateTimeToUTC4(booking.gig_instance_details.date).format("YYYY-MM-DD"),
        start_time: adjustTimeToUTC4(booking.gig_instance_details.start_time).format("HH:mm"),
        end_time: adjustTimeToUTC4(booking.gig_instance_details.end_time).format("HH:mm"),
      }
    }));
    console.log('ADJUSTED GIG')
    console.log(adjustedGigs);
    setBookingRequests(adjustedGigs);
    // Assuming fetchUpcomingGigs is defined elsewhere and works correctly
    fetchUpcomingGigs(userInfo.id);
  } catch (error) {
    console.error('Failed to fetch booking requests:', error);
    Alert.alert('Error', 'Failed to fetch booking requests.');
  }
};

  const handleAcceptBooking = async (bookingId) => {
      try {
        const csrfToken = await AsyncStorage.getItem('csrfToken');

          await axios.post(`http://127.0.0.1:8000/gig/accept-booking/${bookingId}/`, 
          { status: 'accepted' }, 
          { headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          } }); // Replace with your token
          Alert.alert('Success', 'Booking accepted.');
          fetchBookingRequests();
      } catch (error) {
          console.error('Failed to accept booking:', error);
          Alert.alert('Error', 'Failed to accept booking.');
      }
  };

  const handleDeclineBooking = async (bookingId) => {
      try {
        const csrfToken = await AsyncStorage.getItem('csrfToken');
          await axios.patch(`http://127.0.0.1:8000/gig/decling-booking/${bookingId}/`, 
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
  
  const socialIcons = {
    facebook: 'facebook',
    instagram: 'instagram',
    // Add more mappings as needed
  };

  const getSocialIconName = (platform) => {
    const socialIcons = {
        facebook: 'facebook',
        instagram: 'instagram',
        twitter: 'twitter', // Example addition
        // Add more mappings as needed
    };

    // Return the corresponding icon name or a default icon if not found
    return socialIcons[platform] || 'account-circle-outline';
};


  return (
    <>
    <CustomAppBar 
      navigation={navigation} 
      userInfo={userInfo} 
      currentScreen="ProviderDashboard" // Adjust this value based on the current screen
    />
    
    <ScreenLayout >
      <ScrollView style={{ flex: 1 }}>
    <View style={styles.profileSection}>
        <Image source={{ uri: userInfo.profilePicture }} style={styles.profilePic} />
        <Text style={styles.name}>{userInfo.firstName}</Text>
        <Text style={styles.bio}>{userInfo.activity.name}</Text>
        
        <View style={styles.socialMediaContainer}>
                        {userInfo.socialMedia.map((social, index) => (
                            <TouchableOpacity key={index} style={styles.socialMediaItem} onPress={() => Linking.openURL(social.url)}>
                                <Icon name={getSocialIconName(social.platform__icon_name)} size={24} color="#4A90E2" />
                                <Text style={styles.socialMediaText}>{social.username}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

        <View style={styles.contactInfo}>
          <Icon name="email" size={20} color="#4A90E2" />
          <Text style={styles.contactText}>{userInfo.email}</Text>
        </View>

        <View style={styles.contactInfo}>
          <Icon name="phone" size={20} color="#4A90E2" />
          <Text style={styles.contactText}>{userInfo.phoneNumber}</Text>
        </View>
      </View>
      <View style={styles.section}>
                    <Text style={styles.upcomingGigsTitle}>Booking Requests</Text>
                    {bookingRequests.length > 0 ? (
                        <FlatList
                        horizontal={true} // Change FlatList direction to horizontal
                        data={bookingRequests}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <BookingRequestItem
                                request={item}
                                handleAcceptBooking={handleAcceptBooking}
                                handleDeclineBooking={handleDeclineBooking}
                            />
                        )}
                    />
                    ) : (
                        <Text style={styles.noGigsText} >No booking requests found.</Text>
                    )}
              </View>

      <View style={styles.section}>

      <Text style={styles.upcomingGigsTitle}>Your Upcoming Gigs</Text>
      {upcomingGigs.length > 0 ? (
        upcomingGigs.map((gig, index) => (
          <FlatList
          data={upcomingGigs}
          horizontal={true} // Change FlatList direction to horizontal
            
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <GigItem gig={item} />}
      />
      
        ))
      ) : (
        <Text style={styles.noGigsText}>No upcoming gigs found.</Text>
      )}
        </View>
      </ScrollView>

    </ScreenLayout>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  section: {
    padding: 20,
  },

  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  socialMediaText: {
    marginLeft: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  upcomingGigsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  gigItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gigDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  noGigsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProviderDashboardScreen;
