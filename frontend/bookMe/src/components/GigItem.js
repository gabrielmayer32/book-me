import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GigItem = ({ gig }) => {
    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingItem}>
                        <Icon name="account-check" size={20} />
            <Text style={styles.bookingText}>{`${item.user_name} - ${item.number_of_slots} slots`}</Text>
        </View>
    );

    return (
        <View style={styles.gigItem}>
            <Text style={styles.gigTitle}>{gig.title}</Text>
            <View style={styles.detailRow}>
            <Icon name="pin" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{`${gig.address}`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{gig.date}</Text>
          </View>
            <View style={styles.detailRow}>
            <Icon name="clock-start" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{`${gig.start_time} - ${gig.end_time}`}</Text>

          </View>
            <FlatList
                data={gig.bookings}
                keyExtractor={(item, index) => `booking-${index}`}
                renderItem={renderBookingItem}
                ListHeaderComponent={<Text style={styles.participantsTitle}>Participants</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    gigItem: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    gigTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
      },
    gigDetails: {
        fontSize: 15,
        color: '#666',
        marginTop: 5,
    },
    participantsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    bookingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        width: 280
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    bookingText: {
        fontSize: 14,
        color: '#666',
    },
});

export default GigItem;
