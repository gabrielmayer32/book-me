// BookingItem.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { Menu, Provider } from 'react-native-paper';

const getStatusColor = ({ status }) => {
    let backgroundColor;
    console.log(status);
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
  

  const BookingItem = ({ item, handleNavigateToLocation, handleCancelBooking }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);
    const statusColor = getStatusColor(item.status); // Define getStatusColor accordingly
    console.log(item)
    
    const toggleMenuVisibility = () => {
        setMenuVisible(!menuVisible);
    };
    return (
        <View style={styles.bookingItem}>
            <Text style={styles.bookingTitle}>{item.gig_title}</Text>
            <Image source={{ uri: item.provider_profile_picture }} style={styles.profilePic} />
           
            <TouchableOpacity style={styles.moreIcon} onPress={toggleMenuVisibility}>
                <Icon name="dots-vertical" size={24} color="#000" />
            </TouchableOpacity>
            <Menu
                visible={menuVisible}
                onDismiss={toggleMenuVisibility}
                anchor={{ x: 200, y: 100 }}> 
                <Menu.Item onPress={() => { handleNavigateToLocation(item.latitude, item.longitude); toggleMenuVisibility(); }} title="Directions" />
                <Menu.Item onPress={() => { handleCancelBooking(item.id); toggleMenuVisibility(); }} title="Cancel Booking" />
            </Menu>
            <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={20} />
                        <Text>{moment(item.gig_date).format('LL')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                    <Icon name="clock" size={20} />
                    <Text>{`${moment(item.gig_start_time, 'HH:mm:ss').add(4, 'hours').format('LT')} - ${moment(item.gig_end_time, 'HH:mm:ss').add(4, 'hours').format('LT')}`}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                <View style={{ ...styles.statusIndicator, borderColor: statusColor }}>
                <Text style={{ color: statusColor }}>{item.status.toUpperCase()}</Text>
            </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    statusIndicator: {
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        alignSelf: 'flex-start',
        marginLeft: 8,
    },
    moreIcon : {
        position: 'absolute',
        top: 0,
        right: 5,
    },
});

export default BookingItem;
