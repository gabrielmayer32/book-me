import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';


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
        setUpcomingGigs(data);
      } catch (error) {
        console.error('Error fetching upcoming gigs:', error);
      }
    };

    fetchUpcomingGigs();
  }, [providerId]);
  
  const renderNextGigPreview = () => {
    if (upcomingGigs.length === 0) return <Text>No upcoming gigs</Text>;

    const nextGig = upcomingGigs[0]; // Assuming gigs are sorted by date
    return (
      <View style={styles.nextGigContainer}>
        <Text style={styles.nextGigTitle}>{nextGig.title}</Text>
        <Text>{nextGig.date} at {nextGig.startTime}</Text>
        <Text>{nextGig.description}</Text>
      </View>
    );
  };

  // Function to render the list of upcoming gigs
  const renderUpcomingGigsList = () => {
    return upcomingGigs.slice(1).map((gig, index) => (
      <View key={index} style={styles.upcomingGigItem}>
        <Text style={styles.gigItemTitle}>{gig.title}</Text>
        <Text>{gig.date}</Text>
      </View>
    ));
  };

  return (
    <ScreenLayout title="Profile Details" showBackButton={true}>
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
        <View style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.upcomingGigsHeader}>Upcoming Gigs</Text>
        {renderNextGigPreview()}
        {renderUpcomingGigsList()}
      </View>
      </View>
     
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
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
  nextGigContainer: {
    // Styling for next gig preview
  },
  upcomingGigItem: {
    // Styling for list items
  },
  gigItemTitle: {
    // Styling for gig item title
  },
});

export default ProfileDetailsScreen;
