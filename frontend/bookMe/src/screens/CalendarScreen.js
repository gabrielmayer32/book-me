import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ScreenLayout from "../components/ScreenLayout";
import CustomAppBar from "../components/CustomProviderBar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios"; // Assuming you're using axios for HTTP requests
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps"; // Ensure MapView and Marker are imported
import DateTimePicker from '@react-native-community/datetimepicker';

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CalendarScreen = ({ navigation, userInfo }) => {


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState(
    new Array(daysOfWeek.length).fill(false),
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [location, setLocation] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const locationData = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : {};

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMapView = () => {
    return (
      <Modal visible={isMapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: -20.27465053394792,
              longitude: 57.55400484492412,
              latitudeDelta: 1,
              longitudeDelta: 1,
            }}
            onPress={(e) => setLocation(e.nativeEvent.coordinate)}
          >
            {location && <Marker coordinate={location} />}
          </MapView>
          <Button
            title="Confirm Location"
            onPress={() => setIsMapVisible(false)}
          />
        </View>
      </Modal>
    );
  };

  const adjustTimeToNearestQuarterHour = (time) => {
    const timeInMinutes = time.getHours() * 60 + time.getMinutes();
    const nearestQuarterHour = Math.round(timeInMinutes / 15) * 15;
    const adjustedHours = Math.floor(nearestQuarterHour / 60);
    const adjustedMinutes = nearestQuarterHour % 60;
    return new Date(time.setHours(adjustedHours, adjustedMinutes));
  };
  
  // In your DateTimePicker onChange handler for start time
  const handleStartTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const adjustedTime = adjustTimeToNearestQuarterHour(selectedTime);
      setStartTime(selectedTime);
    }
  };
  
  // In your DateTimePicker onChange handler for end time
  const handleEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const adjustedTime = adjustTimeToNearestQuarterHour(selectedTime);
      setEndTime(selectedTime);
    }
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
    .map((selected, index) =>
      selected ? dayNameToId[daysOfWeek[index]] : null,
    )
    .filter((id) => id !== null);
  const createGig = async () => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const formattedStartTime = startTime
        .toISOString()
        .split("T")[1]
        .substring(0, 5);
      const formattedEndTime = endTime
        .toISOString()
        .split("T")[1]
        .substring(0, 5);
      const csrfToken = await AsyncStorage.getItem("csrfToken");
      const response = await axios.post(
        "http://127.0.0.1:8000/gig/create/",
        {
          title,
          description,
          price,
          max_people: parseInt(maxPeople, 10),
          date: isRecurring ? null : formattedDate,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          is_recurring: isRecurring,
          recurring_days: selectedDayIds,
          ...locationData, // Include the location data in your request
          // Handle recurring_days and other fields as needed
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken, // Include CSRF token in the request header
          },
        },
      );
          
      if (response.status === 201) {
        console.log("Gig created successfully:", response.data);
        navigation.navigate("ProviderGigs", { gigId: response.data.id });
      } else {
        console.error("Failed to create gig:", response.data);
        // Handle error, show an error message
      }
    } catch (error) {
      console.error("Error creating gig:", error);
      console.error("Validation error:", response.data);
    }
  };

  const toggleDaySelection = (index) => {
    const updatedSelectedDays = selectedDays.map((selected, idx) =>
      idx === index ? !selected : selected,
    );
    setSelectedDays(updatedSelectedDays);
  };

  const EndTimePicker = ({ endTime, setEndTime }) => {
    const [isPickerVisible, setPickerVisibility] = useState(false);

    const showPicker = () => {
      setPickerVisibility(true);
    };

    const hidePicker = () => {
      setPickerVisibility(false);
    };

    const handleConfirm = (date) => {
      console.log("An end time has been picked: ", date);
      setEndTime(date); // Update the end time state
      hidePicker();
    };

    return (
      <View>
        <Button title="Show End Time Picker" onPress={showPicker} />
        <DateTimePickerModal
  isVisible={isPickerVisible}
  mode="time"
  onConfirm={(date) => {
    console.log("A date or time has been picked: ", date);
    // Set the state or perform an action with the selected date/time
    hidePicker(); // Assuming this sets `isPickerVisible` to false
  }}
  onCancel={hidePicker} // Assuming this sets `isPickerVisible` to false
  // Other necessary props
/>
      </View>
    );
  };

  const NonRecurringDatePicker = () => (
    !isRecurring && (
      <DateTimePickerModal
        testID="dateTimePickerDate"
        value={date}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setDate(selectedDate || date);
        }}
      />
    )
  );

  const StartTimePicker = () => {
    const [isPickerVisible, setPickerVisibility] = useState(false);

    const showPicker = () => {
      setPickerVisibility(true);
    };

    const hidePicker = () => {
      setPickerVisibility(false);
    };

    const handleConfirm = (date) => {
      console.log("A date has been picked: ", date);
      setStartTime(date); // Assuming you have a setStartTime function available
      hidePicker();
    };

    return (
      <View>
        <Button title="Show Start Time Picker" onPress={showPicker} />
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hidePicker}
        />
      </View>
    );
  };

  return (
    <ScreenLayout title="Create a Gig" showBackButton={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, styles.multilineInput]} multiline />
        <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Max People" value={maxPeople} onChangeText={setMaxPeople} keyboardType="numeric" style={styles.input} />

        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Is this gig recurring?</Text>
          <TouchableOpacity style={[styles.toggleButton, isRecurring ? styles.toggleButtonActive : {}]} onPress={() => setIsRecurring(!isRecurring)}>
            <Text style={styles.toggleButtonText}>{isRecurring ? "Yes" : "No"}</Text>
          </TouchableOpacity>
        </View>

        {isRecurring && (
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day, index) => (
              <TouchableOpacity key={day} style={[styles.dayButton, selectedDays[index] ? styles.dayButtonSelected : {}]} onPress={() => toggleDaySelection(index)}>
                <Text style={styles.dayButtonText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isRecurring && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => setDate(selectedDate || date)}
              style={styles.dateTimePicker}
            />
          </View>
        )}

        <View style={styles.timePickerContainer}>
        <Text style={styles.timeLabel}>Start  Time</Text>
        <DateTimePicker
    value={startTime}
    mode="time"
    is24Hour={true}
    display="default"
    onChange={handleStartTimeChange}
    style={styles.dateTimePicker}
  />
        <Text style={styles.timeLabel}>End  Time</Text>

        <DateTimePicker
    value={endTime}
    mode="time"
    is24Hour={true}
    display="default"
    onChange={handleEndTimeChange}
    style={styles.dateTimePicker}
  />
        </View>

        <TouchableOpacity style={styles.buttonPin} onPress={() => setIsMapVisible(true)}>
        <Icon name="pin" size={20} color="#fff" />

          <Text style={styles.buttonText}>Choose Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={createGig}>
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Create Gig</Text>
        </TouchableOpacity>
      </ScrollView>
      {renderMapView()}
    </ScreenLayout>
  );
};
const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    input: {
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 5,
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    timeLabel : {
        fontSize: 14,
        marginTop: 10,
        marginLeft: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F8EF7',
        padding: 10,
        borderRadius: 20,
        justifyContent: 'center',
        margin: 10,
      },
    // button: {
    //   backgroundColor: '#007bff',
    //   padding: 15,
    //   borderRadius: 5,
    //   flexDirection: 'row',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   marginBottom: 15,
    // },
    buttonPin: {
        marginLeft: '15%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F8EF7',
        padding: 10,
        borderRadius: 20,
        justifyContent: 'center',
        margin: 10,
        marginBottom: 15,
        width: '70%',
      },

    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 10,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    toggleButton: {
      borderWidth: 1,
      borderColor: '#007bff',
      borderRadius: 5,
      padding: 10,
    },
    toggleButtonActive: {
      backgroundColor: '#007bff',
    },
    toggleButtonText: {
      color: '#007bff',
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
    },
    dayButton: {
      borderWidth: 1,
      borderColor: '#007bff',
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      marginBottom: 10,
    },
    dayButtonSelected: {
      backgroundColor: '#007bff',
    },
    dayButtonText: {
      color: '#000',
    },
    datePickerContainer: {
      marginBottom: 15,
    },
    timePickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    dateTimePicker: {
      flex: 1,
    },
  });
  
  export default CalendarScreen;