// BookingRequestItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const BookingRequestItem = ({ request, handleAcceptBooking, handleDeclineBooking }) => {
  console.log('REQUEST');
  console.log(request);
    return (
        <View style={styles.bookingRequestItem}>
            <View style={styles.header}>
                <View style={styles.titleAndAddress}>
                    <Text style={styles.bookingTitle}>{request.gig_instance_details.gig_title} | {moment(request.gig_instance.date).format('LL')} | {moment(request.gig_instance_details.start_time, 'HH:mm:ss').format('hh:mm A')}</Text>
                </View>
                {/* Assuming toggleMenuVisibility is handled within the item component or passed down as prop */}
            </View>
            
            <View style={styles.detailRow}>
                        <Icon name="account" size={20} />
                        <Text style={styles.detailText}>{request.user_details.first_name} {request.user_details.last_name}</Text>
                    </View>
                    <View style={styles.details}>

            <View style={styles.detailRow}>
                        <Icon name="account-group" size={20} />
                        <Text style={styles.detailText}>{request.number_of_slots} </Text>
                    </View>



            </View>
            <View style={styles.requestActions}>
                <TouchableOpacity onPress={() => handleAcceptBooking(request.id)} style={styles.acceptButton}>
                    <Text>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeclineBooking(request.id)} style={styles.declineButton}>
                    <Text>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bookingRequestItem: {
      backgroundColor: '#fff', // Use a light background to keep it bright and readable
      borderRadius: 10, // Rounded corners for a modern look
      padding: 15, // Padding inside each booking request item
      marginBottom: 10, // Space between each item
      borderWidth: 1, // Slight border to distinguish items
      borderColor: '#ddd', // Light border color
      elevation: 2, // Subtle shadow for depth (Android)
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 2 }, // Shadow position
      shadowOpacity: 0.1, // Shadow transparency
      shadowRadius: 2, 
      width: 330,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
      },
    header: {
      marginBottom: 10, // Space between the header and the details section
    },
    profilePic: {
      width: 50,
      height: 50,
      borderRadius: 25, // Fully round profile pictures
      marginRight: 10, // Space between the picture and the title
    },
    titleAndAddress: {
      flex: 1, // Allow text to take up remaining space
    },
    bookingTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        flexShrink: 1, // Allows the text to shrink and wrap to a new line as needed
      },
    address: {
      fontSize: 14, // Smaller font for the address
      color: '#666', // Slightly muted color for less emphasis
    },
    details: {
      flexDirection: 'row', // Align details in a row
      justifyContent: 'space-between', // Space out details evenly
      marginBottom: 10, // Space between details and actions
    },
    detailText: {
      fontSize: 14, // Consistent font size for details
      color: '#333', // Darker color for better readability
    },
    requestActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end', 
    },
    acceptButton: {
      marginRight: 10, // Space between buttons
      backgroundColor: '#4CAF50', // Green color for accept
      paddingHorizontal: 20, // Horizontal padding
      paddingVertical: 10, // Vertical padding
      borderRadius: 5, 
      fontStyle: 'bold',
    },
    declineButton: {
      backgroundColor: '#F44336', // Red color for decline
      paddingHorizontal: 20, // Horizontal padding
      paddingVertical: 10, // Vertical padding
      borderRadius: 5, // Rounded corners for buttons
    },
  });

  
export default BookingRequestItem;

// Add StyleSheet styles here
