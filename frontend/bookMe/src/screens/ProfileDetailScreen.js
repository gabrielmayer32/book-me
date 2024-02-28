import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, Linking,Pressable,  ScrollView} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from '../../utils/utcTime';
import GigCard from '../components/GigCard';
import { Picker } from '@react-native-picker/picker';

const ProfileDetailsScreen = ({ route }) => {
  const { providerId, businessName, activity, age, phoneNumber, socials, profileImageUrl } = route.params;
  const [upcomingGigs, setUpcomingGigs] = useState([]);
  const [isBookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(1);
  const [maxSlots, setMaxSlots] = useState(5); // Example max slots, this should come from gig data
  const [selectedGigInstanceId, setSelectedGigInstanceId] = useState(null);

  const handleBookPress = (gigInstanceId) => {
    setSelectedGigInstanceId(gigInstanceId); // Store the selected gig instance ID
    setBookingModalVisible(true); // Show the booking modal
  };
  


  const handleConfirmBooking = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      const response = await fetch(`http://127.0.0.1:8000/gig/book/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          gig_instance_id: selectedGigInstanceId, // Ensure you have this state from selecting a gig
          number_of_slots: selectedSlots,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to book gig');
      }
  
      // Handle successful booking here, such as updating the UI or notifying the user
      alert('Booking successful!');
      setBookingModalVisible(false);
      fetchUpcomingGigs();

    } catch (error) {
      // Handle errors, such as showing an alert to the user
      alert('Error booking gig. Please try again.');
    }
  };
  
  
  const handleSocialPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const fetchUpcomingGigs = async () => {
    // Fetch the CSRF token
    const csrfToken = await AsyncStorage.getItem('csrfToken');
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/gig/provider/${providerId}/upcoming-gigs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming gigs');
      }

      const data = await response.json();
      const adjustedGigs = data.map(gig => ({
        ...gig,
        date: gig.date ? adjustDateTimeToUTC4(gig.date).format() : gig.date,
        start_time: gig.start_time ? adjustTimeToUTC4(gig.start_time).format("HH:mm") : gig.start_time,
        end_time: gig.end_time ? adjustTimeToUTC4(gig.end_time).format("HH:mm") : gig.end_time,
      }));

      setUpcomingGigs(adjustedGigs);
      setSelectedSlots(data.remaining_slots)
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch upcoming gigs. Please try again later.');
    }
  };
  useEffect(() => {
    fetchUpcomingGigs(); // Call this function on component mount
  }, [providerId]);

  const getMonthsFromGigs = (gigs) => {
    const months = {};
  
    gigs.forEach(gig => {
      const date = new Date(gig.date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1));
      const endOfWeek = new Date(startOfWeek.getTime()).setDate(startOfWeek.getDate() + 6);
  
      const weekKey = `Week of ${startOfWeek.getDate()} to ${new Date(endOfWeek).getDate()}`;
  
      if (!months[month]) months[month] = {};
      if (!months[month][weekKey]) months[month][weekKey] = [];
      months[month][weekKey].push(gig);
    });
  
    return months;
  };
  
  
  

  const renderUpcomingGigsList = () => {
    const months = getMonthsFromGigs(upcomingGigs);
    return Object.entries(months).map(([month, weeks], monthIndex) => (
      <View key={monthIndex} style={styles.monthSection}>
        <View style={styles.monthHeaderContainer}>
          <Text style={styles.monthHeader}>{month}</Text>
        </View>
        {Object.entries(weeks).map(([weekRange, gigs], weekIndex) => (
          <View key={weekIndex} style={styles.weekSection}>
            {gigs.map((gig, gigIndex) => {
              const dayOfMonth = new Date(gig.date).getDate();
              return (
                <GigCard
                  key={gigIndex}
                  dayOfMonth={dayOfMonth}
                  title={gig.title}
                  startTime={gig.start_time}
                  remainingSlots={gig.remaining_slots}
                  address={gig.address}
                  endTime={gig.end_time}
                  onBookPress={() => handleBookPress(gig.id)} // Pass gig instance ID to handleBookPress
                  />
              );
            })}
          </View>
        ))}
      </View>
    ));
  };
  
  
  


  return (
    <ScreenLayout title="Profile Details" showBackButton={true}>
                 <ScrollView contentContainerStyle={styles.scrollViewContainer}>

      <View style={styles.container}>
        {/* <Card style={styles.card}> */}
          {/* <Card.Content> */}
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <Text style={styles.name}>{businessName} </Text>
            <Text style={styles.bio}>{activity}</Text>
            
            <View style={styles.detailRow}>
              <Icon name="phone" size={20} color="#555" />
              <Text style={styles.detailText}>{phoneNumber}</Text>
            </View>

            <View style={styles.socialsContainer}>
              {socials.map((social, index) => (
                <TouchableOpacity key={index} onPress={() => handleSocialPress(social.url)}>
                  <View style={styles.socialButton}>
                    <Icon name={social.icon} size={20} color="#555" style={styles.socialIcon} />
                    <Text style={styles.socialText}></Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          {/* </Card.Content> */}
          {/* <Card.Actions style={styles.actions}> */}
            {/* <Button icon="calendar-check" mode="contained" onPress={() => console.log('Book Me action')} style={styles.bookButton}>
              Book Me
            </Button> */}
          {/* </Card.Actions> */}
        {/* </Card> */}
        <View style={{ width: '100%', padding: 20 }}>
        {/* <Text style={styles.upcomingGigsHeader}>Upcoming </Text> */}
        {/* {renderNextGigPreview()} */}
        {renderUpcomingGigsList()}
        {isBookingModalVisible && (
        <Modal animationType="slide" transparent={true} visible={isBookingModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Confirm your booking</Text>
            <Text style={styles.modalText}>Choose how many places you book </Text>

            <Picker
              selectedValue={selectedGigInstanceId.remaining_slots}
              style={styles.pickerStyle}
              onValueChange={(itemValue) => setSelectedSlots(itemValue)}>
              {[...Array(selectedGigInstanceId.remaining_slots).keys()].map(n => (
                <Picker.Item key={n+1} label={`${n+1}`} value={n+1} />
              ))}
            </Picker>
            <TouchableOpacity onPress={() => handleConfirmBooking(selectedGigInstanceId)} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm <Icon name="check" size={20} color="white" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel <Icon name="close" size={20} color="white" /></Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      
      )}
        
      </View>
      </View>
      </ScrollView>

    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)', // Optional: for dark overlay background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    width: '80%', // Adjust as needed
    // Removed fixed height to allow content to determine height
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    // marginBottom: 15,
    textAlign: "center",
  },
  pickerStyle: {
    width: '100%',
    marginBottom: 20, // Add space below the picker
  },
  confirmButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    // Make sure button is not absolutely positioned
  },
  confirmButtonText: {
    color: "white",
  },
   
  monthSection: {
    marginBottom: 10,
  },
  monthHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10, // Add some space between the icon and the text
  },
  weekHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRowTime: {
    flexDirection: 'row',
    marginTop: 5,

  },
  gigDetails : {
    padding: 10,
  },

  details: {
    marginLeft: 5,
    fontSize: 14,
  },

  gigCard: {
    marginBottom: 8,
    flexDirection: 'row', // Adjust if needed
    alignItems: 'center', // Vertically center the content
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSquare: {
    minWidth: 50, // Minimum width
    minHeight: 70, // Minimum height
    backgroundColor: '#ddd',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  dateText: {
    fontSize: 16, // Adjust as needed
    fontWeight: 'bold', // Make the date stand out
  },

  modalHeader : {
    fontSize: 16, // Adjust as needed
    fontWeight: 'bold', // Make the date stand out
    marginBottom: 5, // Add some space below the header

  },
  gigItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    width: '90%',
    maxWidth: 360,
  },
  profileImage: {
    width: 100, // Set the width
    height: 100, // Ensure the height is the same as the width for a perfect circle
    borderRadius: 50, // Half the width and height to make a perfect circle
    alignSelf: 'center',
    marginBottom: 16,
    resizeMode: 'cover', // Cover, contain, stretch, or center
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
  },
  socialsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  socialIcon: {
    marginRight: 6,
  },
  socialText: {
    fontSize: 16,
  },
  actions: {
    justifyContent: 'center',
    marginTop: 20,
  },
  
  upcomingGigsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
    weekSection: {
      marginBottom: 20,
    },
    weekHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    upcomingGigItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    gigIcon: {
      marginRight: 10,
    },
   
   
  monthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
});

export default ProfileDetailsScreen;
