import React, { useState, useEffect } from 'react';
import { View, Text, Button , TouchableOpacity, Image, ScrollView,Linking, FlatList, StyleSheet} from 'react-native';
import { useUser } from '../UserContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment'; // Import moment
import { Menu, Provider } from 'react-native-paper';
import { Alert } from 'react-native';
import BookingItem from '../components/BookingItem';
import {BACKEND_URL} from '../../utils/constants/';

const BookingsScreen = () => {
    const { userInfo } = useUser();
    const [bookings, setBookings] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Adjust this URL to match your API endpoint
                const response = await axios.get(`${BACKEND_URL}/gig/bookings/user/${userInfo.id}/`);
                const adjustedBookings = response.data.map(booking => ({
                    ...booking,
                    // Adjust start and end time by adding 4 hours to each
                    gig_start_time: moment(booking.gig_start_time, 'HH:mm').add(4, 'hours').format('HH:mm'),
                    gig_end_time: moment(booking.gig_end_time, 'HH:mm').add(4, 'hours').format('HH:mm'),
                }));
                setBookings(adjustedBookings);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            }
        };
        fetchBookings();
    }, [userInfo.id]);

    const handleCancelBooking = async (bookingId) => {
        try {
            await axios.post(`http://your-backend.com/api/bookings/cancel/${bookingId}`);
            Alert.alert('Booking Cancelled', 'Your booking has been successfully cancelled.');
            // Refresh bookings list after cancellation
            const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
            setBookings(updatedBookings);
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel booking. Please try again.');
        }
    };

    const handleNavigateToLocation = (latitude, longitude) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };

    const getStatusColor = ({ status }) => {
        let backgroundColor;
        switch (status) {
          case 'pending':
            backgroundColor = 'orange';
            break;
          case 'accepted':
            backgroundColor = 'green';
            break;
          case 'declined':
            backgroundColor = 'red';
            break;
          default:
            backgroundColor = 'grey';
        }
      
        return backgroundColor;
      };

    

    return (
        <View style={styles.container}>
            <FlatList
                data={bookings}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <BookingItem
                        item={item}
                        handleNavigateToLocation={handleNavigateToLocation}
                        handleCancelBooking={handleCancelBooking}
                    />
                )}
            />
            
        </View>
                    
      
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
    },
    detailText: {
        marginLeft: 8, // Adjust spacing
        fontSize: 14, // Increase readability
    },
    statusContainer: {
        marginTop: 5,
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        alignSelf: 'flex-start',
        marginLeft: 8,
      },
      detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
      },
    bookingItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    bookingTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    topImage: {
      width: '90%', // Maintains the width at 80% of its container's width
      height: 200, // Adjust height as needed
      alignSelf: 'center', // Centers the image horizontally within the ScrollView
      borderRadius: 20, // Adjust this value to control the roundness of the corners
      marginTop: 20, // Optional: adds some space at the top, adjust as needed
      marginBottom: 20, // Optional: adds some space below the image, adjust as needed
    },
    collaboratorsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
      marginLeft: 10, // For some spacing from the screen edge
    },

    bookingItem: {
        flexDirection: 'column',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    bookingTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        position: 'absolute',
        top: 10,
        right: 10,
    },
    moreIcon : {
        position: 'absolute',
        top: 0,
        right: 5,
    },
    statusIndicator: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        alignSelf: 'flex-start',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    details: {
        marginTop: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

});


export default BookingsScreen;
