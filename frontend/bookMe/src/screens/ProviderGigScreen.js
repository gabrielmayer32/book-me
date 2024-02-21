import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import CustomAppBar from '../components/CustomProviderBar';
import ScreenLayout from '../components/ScreenLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment'; // Import moment
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from '../../utils/utcTime';


const ProviderGigsScreen = ({ navigation }) => {
  const [gigs, setGigs] = useState([]);
  const { userInfo } = useUser();
  useEffect(() => {
    console.log(userInfo)
    if (userInfo && userInfo.id) { // Ensure userInfo and userInfo.id are available
      const loadGigs = async () => {
        const providerGigs = await fetchProviderGigs(userInfo.id);
        // TO add to have utc time 
        const adjustedGigs = providerGigs.map(gig => ({
            ...gig,
            date: gig.date ? adjustDateTimeToUTC4(gig.date).format() : gig.date,
            start_time: gig.start_time ? adjustTimeToUTC4(gig.start_time).format("HH:mm:ss") : gig.start_time,
            end_time: gig.end_time ? adjustTimeToUTC4(gig.end_time).format("HH:mm:ss") : gig.end_time,
          }));
        setGigs(adjustedGigs);
        console.log(providerGigs)
      };
  
      loadGigs();
    }
  }, [userInfo]); // Re-fetch gigs if userInfo changes
  

  // Assuming userInfo.id contains the provider's ID
  const fetchProviderGigs = async (providerId) => {
    const csrfToken = await AsyncStorage.getItem('csrfToken'); 
    console.log('pokkkk')
    try {
      const response = await fetch(`http://127.0.0.1:8000/gig/get/?providerId=${providerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include the authorization header if needed
          'X-CSRFToken': csrfToken, 
        },
      });
      if (!response.ok) throw new Error('Failed to fetch gigs');
      const gigs = await response.json();
      console.log(gigs)
      return gigs;
    } catch (error) {
      console.error('Error fetching gigs:', error);
      return []; // Return an empty array as a fallback
    }
  };

  function recurringDaysToString(recurringDays) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Convert array of day numbers to day names
    const dayNamesString = recurringDays.map(dayNum => dayNames[dayNum % 7]).join(", ");
    return dayNamesString || "Not specified"; // Provide a fallback text
  }
  
  
  const GigItem = ({ item, onEditPress }) => {
    // Calculate duration
    const startTime = moment(item.start_time, "HH:mm");
    const endTime = moment(item.end_time, "HH:mm");
    const duration = moment.duration(endTime.diff(startTime)).asMinutes();
  
    // Determine if the event is recurring or on a specific date
    const isRecurring = item.date && item.date.includes('every'); // Adjust based on your data structure
  
    return (
      <View style={styles.gigItem}>
        <View style={styles.gigInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.detailRow}>
            <Icon name="information" size={20} color="#4F8EF7" />
            <Text style={styles.details}>{item.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="clock-start" size={20} color="#4F8EF7" />
            <Text style={styles.details}>{item.start_time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="clock" size={20} color="#4F8EF7" />
            <Text style={styles.details}>{`${duration} minutes`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="account-group" size={20} color="#4F8EF7" />
            <Text style={styles.details}>{`${item.max_people}`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="currency-usd" size={20} color="#4F8EF7" />
            <Text style={styles.details}>{`Rs ${item.price}`}</Text>
          </View>
          <View style={styles.detailRow}>
  {item.is_recurring ? (
    <>
      <Icon name="reload" size={20} color="#4F8EF7" />
      {/* Display something meaningful for recurring events, like "Every Monday" */}
      <Text style={styles.details}>Every {recurringDaysToString(item.recurring_days)}</Text>
    </>
  ) : item.date ? (
    <>
      <Icon name="calendar" size={20} color="#4F8EF7" />
      <Text style={styles.details}>{moment(item.date).format('DD MMM YYYY')}</Text>
    </>
  ) : (
    // Handle cases where there's no date (for consistency, even if it shouldn't happen for non-recurring events)
    <>
      <Icon name="calendar-question" size={20} color="#4F8EF7" />
      <Text style={styles.details}>No date</Text>
    </>
  )}
</View>

        </View>
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <Icon name="pencil" size={24} color="#4F8EF7" />
        </TouchableOpacity>
      </View>
    );
  };
  
  
  
  const renderGigItem = ({ item }) => (
    <GigItem 
      item={item} 
      onEditPress={() => navigation.navigate('EditGig', { gigId: item.id })} 
    />
  );

  const handleEditGig = (gigId) => {
    // Navigate to the Edit Gig screen, passing the selected gig's ID
    navigation.navigate('EditGig', { gigId });
  };

  const navigateToCreateGig = () => {
    navigation.navigate('Calendar'); // Ensure 'CalendarScreen' matches your route name
};

return (
    <>
      <CustomAppBar 
  navigation={navigation} 
  userInfo={userInfo} 
  currentScreen="ProviderGigs" // Adjust this value based on the current screen
/> 
      <ScreenLayout>
        <FlatList
          data={gigs}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <TouchableOpacity style={styles.createButton} onPress={navigateToCreateGig}>
              <Icon name="plus" size={20} color="white" />
              <Text style={styles.createButtonText}>Create Gig</Text>
            </TouchableOpacity>
          )}
          renderItem={renderGigItem}
        />
      </ScreenLayout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
    gigItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    gigInfo: {
      flex: 1,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    details: {
      marginLeft: 5,
      fontSize: 14,
    },
    
  editButton: {
    marginLeft: 10,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F8EF7',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    margin: 10,
  },
  createButtonText: {
    color: 'white',
    marginLeft: 5,
  }
});

export default ProviderGigsScreen;
