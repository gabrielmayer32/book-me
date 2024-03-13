import React, { useState, useEffect } from "react";
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
import { Checkbox } from 'react-native-paper';
import {BACKEND_URL} from '../../utils/constants/';
import RecurringGigModal from '../components/RecurringGigModal';
import { useTheme } from 'react-native-paper';




const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CalendarScreen = ({ navigation, userInfo,route  }) => {

    const { colors } = useTheme(); // Accessing the theme

  const templateData = route.params?.templateData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState(
    new Array(daysOfWeek.length).fill(false),
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [location, setLocation] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);
  
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  dateDisplay: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  buttonTime: {
    color: 'black',
    fontStyle: 'normal',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center', // This centers the text horizontally
    justifyContent: 'center', // This centers it vertically
    borderWidth: 1,
  },
  buttonTextTime: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  datePickerContainer: {
    marginLeft: 10,
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Vertically center items
    marginBottom: 15,
    marginTop: 10,
  },

  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000', // Adjust color based on your theme
    marginRight: 10, // Adds some space between the label and the button
  },
  datePickerButton: {
    flexDirection: 'row', // Align button text and icon in a row
    alignItems: 'center',
    backgroundColor: '#E8E8E8', // A light background color for the button
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  datePickerText: {
    marginRight: 5, // Space between the date text and the icon
    color: '#4F8EF7', // Button text color
  },
  inputLabelTime : {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000', // Adjust color based on your theme
    marginBottom: 4, // Space between label and input field

  },


  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000', // Adjust color based on your theme
    marginBottom: 4, // Space between label and input field
    marginLeft: 10, // Align with the input text
  },
  inputShort: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '50%',
    borderRadius: 5,
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
  templateText : {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 10,
},
  timeLabel : {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 28,
  },
  button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
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
      backgroundColor: colors.button,
      padding: 10,
      borderRadius: 5,
      justifyContent: 'center',
      margin: 10,
      marginBottom: 15,
      width: '70%',
    },


  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
  },
  toggleButtonActive: {
    color: colors.button,
    marginLeft: 10,
  },
  toggleButtonText: {
    color: 'black',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    color: '#000',
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
  const locationData = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : {};
    const [isTemplate, setIsTemplate] = useState(false); // New state for the checkbox
    const [isPackageUnapplicable, setIsPackageUnapplicable] = useState(false);

    useEffect(() => {
      if (templateData) {
        // Pre-fill form fields with templateData
        setTitle(templateData.title);
        setDescription(templateData.description);
        // Continue for other fields
      }
    }, [templateData]);
  
    const handleCreateGigPress = async () => {
      // Basic validation to check all fields are filled
      if (!title || !description || !price || !maxPeople || 
          !date || (!isRecurring && (!startTime || !endTime)) || 
          (isRecurring && selectedDays.every(day => !day))) {
        alert("Please fill in all fields.");
        return;
      }
    
      // Further validation can go here (e.g., price and maxPeople should be positive numbers)
    
      if (isRecurring) {
        setIsRecurringModalVisible(true);
      } else {
        await createGig();
      }
    };
    
    // Handling modal submission
    const handleModalSubmit = (months, weeks) => {
      setIsRecurringModalVisible(false); // Close the modal
      createGig(months, weeks); // Directly create the gig with duration
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
    
    const createGig = async (durationMonths, durationWeeks) => {
      try {
        const formattedDate = date.toISOString().split("T")[0];
        const formattedStartTime = startTime.toISOString().split("T")[1].substring(0, 5);
        const formattedEndTime = endTime.toISOString().split("T")[1].substring(0, 5);
        const csrfToken = await AsyncStorage.getItem("csrfToken");
    
        const gigData = {
          title,
          description,
          price,
          max_people: parseInt(maxPeople, 10),
          date: isRecurring ? null : formattedDate,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          is_recurring: isRecurring,
          recurring_days: selectedDayIds,
          is_template: isTemplate,
          package_unapplicable: isPackageUnapplicable,
          ...locationData,
          // Conditionally include the duration fields
          ...(isRecurring && {
            duration_months: parseInt(durationMonths, 10),
            duration_weeks: parseInt(durationWeeks, 10),
          }),
        };
    
        const response = await axios.post(
          `${BACKEND_URL}/gig/create/`,
          gigData,
          {
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken, // Include CSRF token in the request header
            },
          }
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
      console.log("A start time has been picked: ", date);
      setEndTime(date);
      hidePicker();
    };
  
    // Function to format the date to hh:mm
    const formatTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes}`;
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={showPicker} style={styles.buttonTime}>
          <Text style={styles.buttonTextTime}>{formatTime(endTime)}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hidePicker}
          date={endTime}
        />
      </View>
    );
  };
  


  const StartTimePicker = ({ startTime, setStartTime }) => {
    const [isPickerVisible, setPickerVisibility] = useState(false);
  
    const showPicker = () => {
      setPickerVisibility(true);
    };
  
    const hidePicker = () => {
      setPickerVisibility(false);
    };
  
    const handleConfirm = (date) => {
      console.log("A start time has been picked: ", date);
      setStartTime(date);
      hidePicker();
    };
  
    // Function to format the date to hh:mm
    const formatTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes}`;
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={showPicker} style={styles.buttonTime}>
          <Text style={styles.buttonTextTime}>{formatTime(startTime)}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hidePicker}
          date={startTime}
        />
      </View>
    );
  };
  


  const NonRecurringDatePicker = ({ date, setDate }) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
    const showDatePicker = () => {
      setDatePickerVisibility(true);
    };
  
    const hideDatePicker = () => {
      setDatePickerVisibility(false);
    };
  
    const handleConfirm = (selectedDate) => {
      setDate(selectedDate);
      hideDatePicker();
    };
    
    const formatDate = (date) => {
      const day = `0${date.getDate()}`.slice(-2); // Ensures two digits
      const month = `0${date.getMonth() + 1}`.slice(-2); // Month is 0-indexed, add 1
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    // Format the displayed date for readability
    
  
    return (
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Date</Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={date}
        />
      </View>
    );
  };


  return (
    <>
    <CustomAppBar 
      navigation={navigation} 
      userInfo={userInfo} 
      currentScreen="ProviderGigs" // Adjust this value based on the current screen
    />
    
    <ScreenLayout title="Create a Gig" showBackButton={true}>
      <ScrollView contentContainerStyle={styles.container}>
        
      <Text style={styles.inputLabel}>Title</Text>
    <TextInput 
      placeholder="Enter gig title" 
      value={title} 
      onChangeText={setTitle} 
      style={styles.input} 
    />

    {/* Description Input */}
    <Text style={styles.inputLabel}>Describe your gig </Text>
    <TextInput 
      placeholder="Enter gig description" 
      value={description} 
      onChangeText={setDescription} 
      style={[styles.input, styles.multilineInput]} 
      multiline 
    />

    {/* Price Input */}
    <Text style={styles.inputLabel}>Price per person - in Rs.</Text>
    <TextInput 
      placeholder="Enter price" 
      value={price} 
      onChangeText={setPrice} 
      keyboardType="numeric" 
      style={styles.inputShort} 
    />

    {/* Max People Input */}
    <Text style={styles.inputLabel}>Max number of people</Text>
    <TextInput 
      placeholder="Enter max people" 
      value={maxPeople} 
      onChangeText={setMaxPeople} 
      keyboardType="numeric" 
      style={styles.inputShort} 
    />

        <View style={styles.toggleContainer}>
          <Text style={styles.inputLabelTime}>Is this gig recurring?</Text>
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
          <NonRecurringDatePicker
          date={date}
          setDate={setDate}
        />
        )}

        <View style={styles.timePickerContainer}>
        <Text style={styles.timeLabel}>Start  Time</Text>
        <StartTimePicker
          startTime={startTime}
          setStartTime={setStartTime}
        />
        <Text style={styles.timeLabel}>End  Time</Text>

        <EndTimePicker
          endTime={endTime}
          setEndTime={setEndTime}
        />
        </View>
       
        <TouchableOpacity style={styles.buttonPin} onPress={() => setIsMapVisible(true)}>
        <Icon name="pin" size={20} color="#fff" />

          <Text style={styles.buttonText}>Choose Location</Text>
        </TouchableOpacity>
        <View style={styles.checkboxContainer}>
  <Text style={styles.templateText}>Package Not Applicable</Text>
  <Checkbox.Android
    status={isPackageUnapplicable ? 'checked' : 'unchecked'}
    onPress={() => setIsPackageUnapplicable(!isPackageUnapplicable)}
    color={isPackageUnapplicable ? '#6200ee' : undefined} // Or any color you prefer
  />
</View>
{!templateData?.is_template && (
        <View style={styles.checkboxContainer}>
        
        <Text style={styles.templateText}>Save as template ? </Text>
        <Checkbox.Android
            status={isTemplate ? 'checked' : 'unchecked'}
            onPress={() => setIsTemplate(!isTemplate)}
            color={isTemplate ? '#6200ee' : undefined} // Change to your preferred color
            uncheckedColor="black" // Optional: color when unchecked
          />
          </View>
        )}
       <>
  <TouchableOpacity style={styles.button} onPress={handleCreateGigPress}>
    <Icon name="plus" size={20} color="#fff" />
    <Text style={styles.buttonText}>Create Gig</Text>
  </TouchableOpacity>
  
  <RecurringGigModal
    isVisible={isRecurringModalVisible}
    onClose={() => setIsRecurringModalVisible(false)}
    onSubmit={handleModalSubmit}
  />
</>
      </ScrollView>
      {renderMapView()}
    </ScreenLayout>
    </>
  );
};

  
  export default CalendarScreen;