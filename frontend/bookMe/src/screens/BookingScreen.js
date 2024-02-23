import React, { useState, useEffect } from 'react';
import { View, Text, Button , TouchableOpacity, Image, ScrollView,Linking, FlatList, StyleSheet} from 'react-native';
import { useUser } from '../UserContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment'; // Import moment



const BookingsScreen = () => {
    const { userInfo } = useUser();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/gig/bookings/user/${userInfo.id}/`);
                setBookings(response.data);
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

    const StatusIndicator = ({ status }) => {
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
      
        return (
          <View style={[styles.statusContainer, { borderColor: backgroundColor }]}>
            <Text style={{ color: backgroundColor }}>{status.toUpperCase()}</Text>
          </View>
        );
      };

    return (
        <View style={styles.container}>
            <FlatList
                data={bookings}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.bookingItem}>
                        <Text style={styles.bookingTitle}>{item.gig_title} </Text>
                        <View style={styles.detailRow}>
                        <Icon name="calendar" size={20} color="#4F8EF7" />

                        <Text>
                        {`${moment(item.gig_date).format('LL')}`}
                        </Text>
                        </View>
                        <View style={styles.detailRow}>
                        <Icon name="clock" size={20} color="#4F8EF7" />

                        <Text>
                        {`${moment(item.gig_start_time, 'HH:mm').format('LT')} - ${moment(item.gig_end_time, 'HH:mm').format('LT')}`}
                        </Text>
                        </View>
                        
                        <StatusIndicator status={item.status} />
                        <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleCancelBooking(item.id)}>
                            <Icon name="cancel" size={24} color="red" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleNavigateToLocation(item.latitude, item.longitude)}>
                            <Icon name="map-marker" size={24} color="blue" />
                        </TouchableOpacity>
                        </View>
                    </View>
                    
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
    statusContainer: {
        marginTop: 5,
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        alignSelf: 'flex-start',
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

});


export default BookingsScreen;
