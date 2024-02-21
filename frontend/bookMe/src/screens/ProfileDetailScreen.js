import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from '../../utils/utcTime';
import GigCard from '../components/GigCard';

const ProfileDetailsScreen = ({ route }) => {
  const { providerId, firstName, activity, age, phoneNumber, socials, profileImageUrl } = route.params;
  const [upcomingGigs, setUpcomingGigs] = useState([]);

  const handleSocialPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  useEffect(() => {
    const fetchUpcomingGigs = async () => {
      const csrfToken = await AsyncStorage.getItem('csrfToken'); 


      try {
        const response = await fetch(`http://127.0.0.1:8000/gig/provider/${providerId}/upcoming-gigs/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include any necessary headers, such as Authorization for JWT
            'X-CSRFToken': csrfToken, // Include CSRF token in the request header
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming gigs');
        }
        
        const data = await response.json();
        console.log(data)
        const adjustedGigs = data.map(gig => ({
          ...gig,
          address: gig.address.split(',')[0], // This will take the substring before the first comma

          date: gig.date ? adjustDateTimeToUTC4(gig.date).format() : gig.date,
          start_time: gig.start_time ? adjustTimeToUTC4(gig.start_time).format("HH:mm") : gig.start_time,
          end_time: gig.end_time ? adjustTimeToUTC4(gig.end_time).format("HH:mm") : gig.end_time,
        }));        
        setUpcomingGigs(adjustedGigs);
      } catch (error) {
        console.error('Error fetching upcoming gigs:', error);
      }
    };

    fetchUpcomingGigs();
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
        <Card style={styles.card}>
          <Card.Content>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <Text style={styles.name}>{firstName}, {age}</Text>
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
          </Card.Content>
          <Card.Actions style={styles.actions}>
            {/* <Button icon="calendar-check" mode="contained" onPress={() => console.log('Book Me action')} style={styles.bookButton}>
              Book Me
            </Button> */}
          </Card.Actions>
        </Card>
        <View style={{ width: '100%', padding: 20 }}>
        <Text style={styles.upcomingGigsHeader}>Upcoming Gigs</Text>
        {/* {renderNextGigPreview()} */}
        {renderUpcomingGigsList()}
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
    fontSize: 18, // Adjust as needed
    fontWeight: 'bold', // Make the date stand out
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
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
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
  bookButton: {
    paddingHorizontal: 8,
  },
  upcomingGigsHeader: {
    fontSize: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
});

export default ProfileDetailsScreen;
