import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenLayout from '../components/ScreenLayout';
import CustomAppBar from '../components/CustomProviderBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
import AsyncStorage from '@react-native-async-storage/async-storage';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CalendarScreen = ({ navigation, userInfo }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [maxPeople, setMaxPeople] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDays, setSelectedDays] = useState(new Array(daysOfWeek.length).fill(false));
    const [isRecurring, setIsRecurring] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showStartTimePicker, setShowStartTimePicker] = useState(true);
    const [showEndTimePicker, setShowEndTimePicker] = useState(true);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };
    const dayNameToId = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7,
    };

    const selectedDayIds = selectedDays
        .map((selected, index) => selected ? dayNameToId[daysOfWeek[index]] : null)
        .filter(id => id !== null);
    const createGig = async () => {
        try {
            const formattedDate = date.toISOString().split('T')[0]; 
            const formattedStartTime = startTime.toISOString().split('T')[1].substring(0, 5); 
            const formattedEndTime = endTime.toISOString().split('T')[1].substring(0, 5);
            const csrfToken = await AsyncStorage.getItem('csrfToken'); 
            console.log('csrfToken:', csrfToken);
            const response = await axios.post('http://127.0.0.1:8000/gig/create/', {
                title,
                description,
                price,
                max_people: maxPeople,
                date: isRecurring ? null : formattedDate,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                is_recurring: isRecurring,
                recurring_days: selectedDayIds, 
                // Handle recurring_days and other fields as needed
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken, // Include CSRF token in the request header
                }
            });

            if (response.status === 201) {
                console.log('Gig created successfully:', response.data);
                // Handle success, maybe navigate or show a success message
            } else {
                console.error('Failed to create gig:', response.data);
                // Handle error, show an error message
            }
        } catch (error) {
            console.error('Error creating gig:', error);
            console.error('Validation error:', response.data);
        }
    };

    // Handler for start time change
    const handleStartTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || startTime;
        setShowStartTimePicker(true);
        setStartTime(currentTime);
    };

    // Handler for end time change
    const handleEndTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || endTime;
        setShowEndTimePicker(true);
        setEndTime(currentTime);
    };


    const toggleDaySelection = (index) => {
        const updatedSelectedDays = selectedDays.map((selected, idx) => idx === index ? !selected : selected);
        setSelectedDays(updatedSelectedDays);
    };



    return (
        <>
           <ScreenLayout>
           <ScrollView contentContainerStyle={styles.scrollViewContainer}>

            <View style={styles.section}>

            <Text style={styles.sectionTitle}>Create a gig </Text>
            <TextInput
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.input}
                            multiline={true}
                            numberOfLines={4}
                        />
                        <TextInput
                            placeholder="Price"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Max People"
                            value={maxPeople}
                            onChangeText={setMaxPeople}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                {/* Add other inputs here */}
</View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Is this gig recurring?</Text>
                    <TouchableOpacity
                        style={styles.toggleButton(isRecurring)}
                        onPress={() => setIsRecurring(!isRecurring)}>
                        <Text style={styles.toggleButtonText}>{isRecurring ? 'Yes' : 'No'}</Text>
                    </TouchableOpacity>
                </View>

                {isRecurring && (
                    <View style={styles.daysContainer}>
                        {daysOfWeek.map((day, index) => (
                            <TouchableOpacity
                                key={day}
                                style={styles.dayButton(selectedDays[index])}
                                onPress={() => toggleDaySelection(index)}>
                                <Text style={styles.dayButtonText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {!isRecurring && (
                    <View style={styles.datePickerContainer}>
                        <Button title="Choose Date" onPress={() => setShowDatePicker(true)} />
                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>
                )}

<View style={styles.section}>
    <Button title="Choose Start Time" onPress={() => setShowStartTimePicker(true)} />
    {showStartTimePicker && (
        <DateTimePicker
            testID="dateTimePickerStart"
            value={startTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleStartTimeChange}
        />
    )}

    <Button title="Choose End Time" onPress={() => setShowEndTimePicker(true)} />
    {showEndTimePicker && (
        <DateTimePicker
            testID="dateTimePickerEnd"
            value={endTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleEndTimeChange}
        />
    )}
    
</View>

        <TouchableOpacity style={styles.createButton} onPress={createGig}>
                    <Icon name="plus" size={20} color="white" />
                    <Text style={styles.createButtonText}>Create Gig</Text>
                    </TouchableOpacity>                
    </ScrollView>

            </ScreenLayout>
        </>
    );
};

const styles = StyleSheet.create({
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F8EF7',
        padding: 10,
        borderRadius: 20,
        justifyContent: 'center',
        margin: 10,
      },
    input: {
        width: '80%',
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
        
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    dayButton: (isSelected) => ({
        backgroundColor: isSelected ? '#007bff' : '#f8f9fa',
        padding: 10,
        margin: 5,
        borderRadius: 20,
    }),
    dayButtonText: {
        color: '#000',
    },
    section: {
        padding: 20,
        marginBottom: 5,
        alignItems: 'center', // Center content horizontally in the container
    },
    
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    toggleButton: (isActive) => ({
        backgroundColor: isActive ? '#007bff' : '#f8f9fa',
        padding: 10,
        borderRadius: 20,
    }),
    toggleButtonText: {
        color: '#000',
        textAlign: 'center',
    },
    datePickerContainer: {
        marginBottom: 20,
    },
    createButtonText: {
        color: 'white',
        marginLeft: 5,
      }
});

export default CalendarScreen;
