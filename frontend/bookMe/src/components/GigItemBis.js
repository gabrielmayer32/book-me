import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Modal, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Button } from "react-native-paper";
import ScreenLayout from "../components/ScreenLayout";
import { useUser } from "../UserContext";
import GigItem from "../components/GigItem";
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from "../../utils/utcTime";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MapView, { Marker } from 'react-native-maps';
import {BACKEND_URL} from '../../utils/constants/';

import moment from 'moment';

     

const GigItemBis = React.memo(({ gig, address, title, maxPeople }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableAddress, setEditableAddress] = useState(gig.address);
    const [editableDate, setEditableDate] = useState(gig.date);
    const [editableStartTime, setEditableStartTime] = useState(adjustTimeToUTC4(gig.start_time).format('HH:mm'));
    const [editableEndTime, setEditableEndTime] = useState(adjustTimeToUTC4(gig.end_time).format('HH:mm'));
    const [editableMaxPeople, setEditableMaxPeople] = useState(gig.max_people);
    
   
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    const handleConfirmStartTime = (date) => {
        // Assuming date is a JavaScript Date object
        let formattedTime = moment(date).format('HH:mm'); // Format the time as "HH:mm"
        setEditableStartTime(formattedTime);
        setStartTimePickerVisibility(false);
    };
    
    const handleConfirmEndTime = (date) => {
        // Assuming date is a JavaScript Date object
        let formattedTime = moment(date).format('HH:mm'); // Format the time as "HH:mm"
        setEditableEndTime(formattedTime);
        setEndTimePickerVisibility(false);
    };
    
    const getStartTimeDate = () => {
        const [hours, minutes] = editableStartTime.split(':').map(Number);
        const startTimeDate = new Date();
        startTimeDate.setHours(hours, minutes);
        return startTimeDate;
    };
    
    // Do the same for editableEndTime
    const getEndTimeDate = () => {
        const [hours, minutes] = editableEndTime.split(':').map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(hours, minutes);
        return endTimeDate;
    };
    const handleDelete = async () => {
        const csrfToken = await AsyncStorage.getItem('csrfToken');

        try {
            const response = await fetch(`${BACKEND_URL}/gig/delete/${gig.id}/`, {
                method: 'DELETE', // Use the DELETE method
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });

            if (response.ok) {
                // If the delete was successful, handle accordingly
                console.log('Gig deleted successfully');
                onDeleteSuccess && onDeleteSuccess(gig.id); // Call a prop function to handle the deletion (like removing the item from a list)
            } else {
                // Handle errors
                console.error('Failed to delete the gig');
            }
        } catch (error) {
            console.error('Error deleting gig', error);
        }
    };


    const handleSave = async () => {
        const updatedGigInstance = {
            address: editableAddress,
            date: editableDate,
            start_time: `${editableStartTime}:00`, // Append seconds if necessary
            end_time: `${editableEndTime}:00`, // Append seconds if necessary
            max_people: parseInt(editableMaxPeople, 10),
        };
        const csrfToken = await AsyncStorage.getItem('csrfToken');

    
        try {
            const response = await fetch(`${BACKEND_URL}/gig/update/${gig.id}/`, {
                method: 'PATCH', // or 'PATCH' if partially updating
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(updatedGigInstance),
            });
    
            const data = await response.json();
            if (response.ok) {
                // Handle successful update
                // For example, update local state or inform the user
                console.log('Update successful', data);
                setIsEditing(false); // Exit edit mode
            } else {
                // Handle errors
                console.error('Update failed', data);
            }
        } catch (error) {
            console.error('Error updating gig', error);
        }
    };
    

    return (
        <View style={styles.gigItem}>
            
            {isEditing ? (
                <>
                    
                     <Button onPress={() => setStartTimePickerVisibility(true)}>Choose Start Time</Button>
                        <DateTimePickerModal
                            isVisible={isStartTimePickerVisible}
                            mode="time"
                            date={getStartTimeDate()} // Use the function to get the Date object
                            onConfirm={handleConfirmStartTime}
                            onCancel={() => setStartTimePickerVisibility(false)}
                        />
                        <Button onPress={() => setEndTimePickerVisibility(true)}>Choose End Time</Button>
                        <DateTimePickerModal
                            isVisible={isEndTimePickerVisible}
                            mode="time"
                            onConfirm={handleConfirmEndTime}
                            onCancel={() => setEndTimePickerVisibility(false)}
                        />
                    <TextInput
                        style={styles.editableText}
                        onChangeText={(text) => setEditableMaxPeople(parseInt(text, 10) || 0)}
                        date={getEndTimeDate()} // Use the function to get the Date object

                        value={editableMaxPeople.toString()}
                        placeholder="Max People"
                        keyboardType="number-pad" // This ensures numpad is shown
                    />

         
                    <Button onPress={handleSave}>Save</Button>
                </>
            ) : (
                <>
                    <View style={styles.detailRow}>
                        <Text style={styles.gigTitle}>{title}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="map-marker" size={20} color="#4F8EF7" />
                        <Text style={styles.detailText}>{editableAddress}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={20} color="#4F8EF7" />
                        <Text style={styles.detailText}>{editableDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="clock-start" size={20} color="#4F8EF7" />
                        <Text style={styles.detailText}>{editableStartTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="clock-end" size={20} color="#4F8EF7" />
                        <Text style={styles.detailText}>{editableEndTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="account" size={20} color="#4F8EF7" />
                        <Text style={styles.detailText}>{editableMaxPeople}</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 100, height: 40, borderRadius: 20, overflow: 'hidden' }}>
                            <Button
                        icon="pencil"
                                mode="contained"
                                onPress={() => setIsEditing(true)}
                                style={{ height: '100%' }} // Makes the button fill the container
                            >
                                Edit
                            </Button>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <Button
                    icon="delete"
                    mode="contained"
                    onPress={handleDelete}
                    style={{ backgroundColor: 'red' }} // Example styling
                >
                    Delete
                </Button>
            </View>
                    </View>
                    

                </>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
    },
    upcomingGigsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    gigItem: {
        backgroundColor: "#FFFFFF",
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
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    monthSection: {
        marginBottom: 10,
    },
    monthHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    monthHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
        marginBottom: 10,
    },
    weekHeader: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    editableText: {
        flex: 1,
        borderWidth: 1,
        borderColor: "gray",
        padding: 8,
        marginVertical: 4,
    },
    gigDetails: {
        fontSize: 15,
        color: "#666",
        marginTop: 5,
    },
    participantsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },
    bookingItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        width: 280,
    },
    // Additional styles...
});
export default GigItemBis;