import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, Linking, ScrollView} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from '../../utils/utcTime';
import GigCard from '../components/GigCard';
import { Picker } from '@react-native-picker/picker';
import {BACKEND_URL} from '../../utils/constants/';
import { Checkbox } from 'react-native-paper'; // Assuming you are using react-native-paper
import {addEventToCalendar} from '../components/addEventToCalendar'; // Import the function to add event to calendar
import * as Calendar from 'expo-calendar';
import snackbarManager from '../../utils/snackbarManager';
import ProviderPackagesList from '../components/ProviderPackagesList'; // Adjust the path as necessary
import { useSubscription } from '../SubscriptionContext'; // Adjust the path as necessary


const ProfileDetailsScreen = ({ route }) => {
  const {
    providerId,
    businessName,
    activity,
    age,
    phoneNumber,
    socials,
    profileImageUrl,
  } = route.params;
  const [upcomingGigs, setUpcomingGigs] = useState([]);
  const [isBookingModalVisible, setBookingModalVisible] = useState(false);
  const [maxSlots, setMaxSlots] = useState(5); // Example max slots, this should come from gig data
  const [selectedGigInstanceId, setSelectedGigInstanceId] = useState(null);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [selectedGigDetails, setSelectedGigDetails] = useState(null);
  const [eventID, setEventID] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null);
  const { subscriptions } = useSubscription();
  const [isSubscribed, setIsSubscribed] = useState(route.params.is_subscribed);

  const [isSubscribedToProvider, setIsSubscribedToProvider] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(1);

  const [currentPackageName, setCurrentPackageName] = useState("your package");
  const [currentPackage, setCurrentPackage] = useState(null);
  const [currentPackageId, setCurentPackageId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [packageUnapplicable, setPackageUnapplicable] = useState(false);

  console.log('WAWAWAW');
  console.log(route.params);

  const handleToggleSubscription = async () => {
    const providerId = route.params.providerId;
    const csrfToken = await AsyncStorage.getItem("csrfToken");

    try {
      const token = await AsyncStorage.getItem("token"); // Assuming you store your token after login
      const response = await fetch(
        `${BACKEND_URL}/accounts/subscribe/${providerId}/`,
        {
          method: "POST",
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setIsSubscribed(result.status === "subscribed");
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };


  const confirmBookingAndAddToCalendar = async () => {
    if (isBookingInProgress) return;

    setIsBookingInProgress(true);

    try {
      let eventId = null; // Initialize eventId as null

      if (addToCalendar && selectedGigDetails) {
        const dateOnly = selectedGigDetails.date.split("T")[0];

        let startDate = new Date(
          `${dateOnly}T${selectedGigDetails.start_time}:00.000Z`
        );
        let endDate = new Date(
          `${dateOnly}T${selectedGigDetails.end_time}:00.000Z`
        );

        startDate.setHours(startDate.getHours() - 4);
        endDate.setHours(endDate.getHours() - 4);

        const eventDetails = {
          title: selectedGigDetails.title,
          startDate: startDate,
          endDate: endDate,
          notes: selectedGigDetails.description,
          location: selectedGigDetails.address,
        };

        // Directly capture the eventId returned by addEventToCalendar
        eventId = await addEventToCalendar(eventDetails);
        console.log(`Event ID: ${eventId}`);
      }

      // Now, call handleConfirmBooking and include eventId
      if (isSubscribedToProvider && !packageUnapplicable) {
        // Use a booking from the subscription
        await useSubscriptionBooking(eventId);
      } else {
        // Proceed with standard booking process
        await handleConfirmBooking(eventId);
      }
      fetchUpcomingGigs();
    } catch (error) {
      console.error("Error booking gig:", error);
      alert("Error booking gig. Please try again.");
    } finally {
      setIsBookingInProgress(false);
      setBookingModalVisible(false);
    }
  };

  const useSubscriptionBooking = async (eventId) => {
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    let requestBody = {
      gig_instance_id: selectedGigInstanceId,
      number_of_slots: selectedSlots,
      event_id: eventId,
    };

    // If booking through a package subscription, include the package_subscription_id
    if (isSubscribedToProvider) {
      requestBody.package_subscription_id = currentPackageId; // Assuming currentPackage contains the package subscription ID
    }
    console.log('PACKAGE ID ')
    console.log(currentPackageId)
    // Assuming you have an endpoint to handle this
    const response = await fetch(`${BACKEND_URL}/gig/book/with-subscription/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(requestBody),

    });
  
    if (!response.ok) {
      throw new Error('Failed to book using subscription');
    }
  
    // Handle successful booking with subscription
    let message = `Booking successful using your package "${currentPackageName}".`;
    if (eventId) {
      message += " The event has been added to your calendar.";
    }
    alert(message);
  };

  const addEventToCalendar = async (eventDetails) => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      console.warn("Calendar permission not granted.");
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const defaultCalendar = calendars.find((c) => c.allowsModifications);

    if (!defaultCalendar) {
      console.warn("No modifiable calendars found.");
      return;
    }

    // Create the event in the calendar
    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: eventDetails.title,
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate,
      notes: eventDetails.notes,
      location: eventDetails.location,
    });

    console.log(
      `Creating event with start date: ${eventDetails.startDate.toISOString()} and end date: ${eventDetails.endDate.toISOString()}`
    );

    console.log(`Event created with ID: ${eventId}`);

    return eventId;
  };

  const handleBookPress = (gigInstanceId, package_unapplicable) => {
    const selectedGig = upcomingGigs.find((gig) => gig.id === gigInstanceId);
    if (selectedGig) {
      setSelectedSlots(1); 
      setPackageUnapplicable(package_unapplicable);
      setMaxSlots(selectedGig.remaining_slots);
      setSelectedGigInstanceId(gigInstanceId);
      setSelectedGigDetails(selectedGig); // Save the entire gig object for later use
      setBookingModalVisible(true);
    }
  };

  const handleConfirmBooking = async (eventId) => {
    // Prevent multiple bookings if one is already in progress
    if (isBookingInProgress) return;
    setIsBookingInProgress(true);

    

    try {
      const csrfToken = await AsyncStorage.getItem("csrfToken");
      let requestBody = {
        gig_instance_id: selectedGigInstanceId,
        number_of_slots: selectedSlots,
        event_id: eventId,
      };

      // If booking through a package subscription, include the package_subscription_id
      if (currentPackage && isSubscribedToProvider) {
        console.log('PACKAGE ID ')
        console.log(currentPackageId)
        console.log(isSubscribedToProvider)
        requestBody.package_subscription_id = currentSubscription.package.id; // Assuming currentPackage contains the package subscription ID
      }
  
      const response = await fetch(`${BACKEND_URL}/gig/book/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to book gig");
      }

      let message = "Booking successful!";
      if (addToCalendar) {
        message += " The event has been added to your calendar.";
      }

      snackbarManager.showMessage(message);

      setBookingModalVisible(false);
      fetchUpcomingGigs();
    } catch (error) {
      console.log("Error booking gig:", error);
      snackbarManager.showMessage("Error booking gig. Please try again.");
    } finally {
      setIsBookingInProgress(false); // Ensure this is reset regardless of booking outcome
    }
  };

  const handleSocialPress = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  const fetchUpcomingGigs = async () => {
    // Fetch the CSRF token
    const csrfToken = await AsyncStorage.getItem("csrfToken");

    try {
      const response = await fetch(
        `${BACKEND_URL}/gig/provider/${providerId}/upcoming-gigs/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch upcoming gigs");
      }

      const data = await response.json();
      const adjustedGigs = data.map((gig) => ({
        ...gig,
        date: gig.date ? adjustDateTimeToUTC4(gig.date).format() : gig.date,
        start_time: gig.start_time
          ? adjustTimeToUTC4(gig.start_time).format("HH:mm")
          : gig.start_time,
        end_time: gig.end_time
          ? adjustTimeToUTC4(gig.end_time).format("HH:mm")
          : gig.end_time,
      }));
      console.log(adjustedGigs);
      setUpcomingGigs(adjustedGigs);
      // setSelectedSlots(data.remaining_slots)
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to fetch upcoming gigs. Please try again later."
      );
    }
  };

  useEffect(() => {
    // Check if the user is subscribed to the current provider
    const checkIsSubscribedToProvider = subscriptions.some(sub => sub.package.owner === providerId);
    setIsSubscribedToProvider(checkIsSubscribedToProvider);

    if (checkIsSubscribedToProvider) {
      const currentSubscription = subscriptions.find(sub => sub.package.owner === providerId);
      const currentPackageName = currentSubscription ? currentSubscription.package.name : "your package";
      setCurentPackageId(currentSubscription.package.id);
      setCurrentPackageName(currentPackageName);
      console.log("Is subscribed to provider:", checkIsSubscribedToProvider);    }
    
  }, [subscriptions, providerId]);
  
 

  useEffect(() => {
     // Assuming `subscriptions` is the array of subscription objects you fetched

    
    fetchUpcomingGigs(); // Call this function on component mount
  }, [providerId]);

  const getMonthsFromGigs = (gigs) => {
    const months = {};

    gigs.forEach((gig) => {
      const date = new Date(gig.date);
      const month = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      const startOfWeek = new Date(
        date.setDate(date.getDate() - date.getDay() + 1)
      );
      const endOfWeek = new Date(startOfWeek.getTime()).setDate(
        startOfWeek.getDate() + 6
      );

      const weekKey = `Week of ${startOfWeek.getDate()} to ${new Date(
        endOfWeek
      ).getDate()}`;

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
                  description={gig.description}
                  package_unapplicable={gig.package_unapplicable}
                  onBookPress={() => handleBookPress(gig.id)}
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
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{businessName} </Text>
          <Text style={styles.bio}>{activity}</Text>

          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#555" />
            <Text style={styles.detailText}>{phoneNumber}</Text>
          </View>

          <View style={styles.socialsContainer}>
            {socials.map((social, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSocialPress(social.url)}
              >
                <View style={styles.socialButton}>
                  <Icon
                    name={social.icon}
                    size={20}
                    color="#555"
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialText}></Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleToggleSubscription}
              style={styles.subscriptionButton}
            >
              <Icon
                name={isSubscribed ? "bell-off" : "bell"}
                size={18}
                color="black"
              />
              <Text style={styles.subscriptionText}>
                {isSubscribed
                  ? "Turn off subscription"
                  : "Turn on subscription"}
              </Text>
            </TouchableOpacity>
          </View>
          <ProviderPackagesList providerId={providerId} />

         
          <View style={{ width: "100%", padding: 20 }}>
           
            {renderUpcomingGigsList()}
            {isBookingModalVisible && (
             <Modal
             animationType="slide"
             transparent={true}
             visible={isBookingModalVisible}
           >
             <View style={styles.centeredView}>
               <View style={styles.modalView}>
                 <View style={styles.checkboxContainer}>
                   <Checkbox.Android
                     status={addToCalendar ? "checked" : "unchecked"}
                     onPress={() => setAddToCalendar(!addToCalendar)}
                   />
                   <Text style={styles.checkboxLabel}>Add to calendar</Text>
                 </View>
                 <Text style={styles.checkboxLabel}>This will use 1 booking from your package "{currentPackageName}" </Text>

                 <Text style={styles.modalHeader}>Confirm your booking</Text>
                 
                 {!isSubscribedToProvider && (
                   <>
                     <Text style={styles.modalText}>
                       Choose how many places you book{" "}
                     </Text>
           
                     <Picker
                       selectedValue={selectedSlots}
                       style={styles.pickerStyle}
                       onValueChange={(itemValue, itemIndex) =>
                         setSelectedSlots(itemValue)
                       }
                     >
                       {[...Array(maxSlots).keys()].map((n) => (
                         <Picker.Item
                           key={n + 1}
                           label={`${n + 1}`}
                           value={n + 1}
                         />
                       ))}
                     </Picker>
                   </>
                 )}
           
                 <TouchableOpacity
                   onPress={confirmBookingAndAddToCalendar}
                   style={styles.confirmButton}
                 >
                   <Text style={styles.confirmButtonText}>
                     Confirm <Icon name="check" size={20} color="white" />
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   onPress={() => setBookingModalVisible(false)}
                   style={styles.cancelButton}
                 >
                   <Text style={styles.cancelButtonText}>
                     Cancel <Icon name="close" size={20} color="white" />
                   </Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, // Adjust as needed for spacing
  },
  checkboxLabel: {
    marginLeft: 8, // Adjust as needed for spacing between the checkbox and its label
    fontSize: 16, // Adjust as needed for label font size
  },
  headerRight: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center', // Ensure vertical alignment in the middle
    justifyContent: 'flex-end',
    marginRight: 20,
    borderWidth: 0.5, // Add a border
    borderColor: 'black', // Set the border color
    borderRadius: 5, // Optional: round the corners of the border
},

subscriptionButton: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Align icon and text vertically in the middle
    justifyContent: 'center', // Center the contents
    paddingVertical: 5, // Add some padding on top and bottom
    paddingHorizontal: 10, // Add some padding on left and right
},
subscriptionText: {
  fontSize: 12,
  textAlign: 'center', // Ensure text is centered, especially useful for multiple lines
  color: 'black',
},

notSubscribed: {
    backgroundColor: 'transparent', // Example for a non-subscribed state
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
