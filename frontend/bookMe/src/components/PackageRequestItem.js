// PackageSubscriptionItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PackageSubscriptionItem = ({ subscription, handleAcceptSubscription, handleDeclineSubscription }) => {
    
    return (
        <View style={styles.subscriptionItem}>
            <View style={styles.header}>
                <Text style={styles.packageTitle}>{subscription.package.name}</Text>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Icon name="information-outline" size={20} />
                    <Text style={styles.detailText}>{subscription.package.description}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={20} />
                    <Text style={styles.detailText}>Duration: {subscription.package.duration} days</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="ticket-account" size={20} />
                    <Text style={styles.detailText}>Bookings: {subscription.package.number_of_bookings}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="cash" size={20} />
                    <Text style={styles.detailText}>Price: Rs {subscription.package.price}</Text>
                </View>
            </View>

            <View style={styles.requestActions}>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptSubscription}>
                    <Icon name="check" size={20} color="white" />
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineButton} onPress={handleDeclineSubscription}>
                    <Icon name="cancel" size={20} color="white" />
                    <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    subscriptionItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: 330,
    },
    header: {
        marginBottom: 10,
    },
    packageTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    details: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    requestActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    declineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
    },
});

export default PackageSubscriptionItem;
