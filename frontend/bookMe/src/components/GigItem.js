import React , {useState, useEfeect} from 'react';
import { View, Text, Modal,  TouchableOpacity, Image, ScrollView, FlatList, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GigItem = ({ gig }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingItem}>
                        <Icon name="account-check" size={20} />
            <Text style={styles.bookingText}>{`${item.user_name} - ${item.number_of_slots} slot(s)`}</Text>
        </View>
    );

    const handleCancelBooking = () => {
        console.log("Cancelling booking for gig:", gig.title);
        // Add your cancel booking logic here
        setMenuVisible(false); // Close the menu after action
    };

    return (
        <View style={styles.gigItem}>
            <View style={styles.gigHeader}>
                <Text style={styles.gigTitle}>{gig.title}</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Icon name="dots-vertical" size={24} color="#4F8EF7" />
                </TouchableOpacity>
            </View>
            {/* <Text style={styles.gigTitle}>{gig.title}</Text> */}
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={handleCancelBooking} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cancel Booking</Text>
                        </TouchableOpacity>
                        {/* Add more actions here */}
                    </View>
                </View>
            </Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginVertical: 10, // Add spacing between buttons
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    gigHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
