import React , { Linking,useEffect, useState }from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenLayout from '../components/ScreenLayout';
import { Appbar } from 'react-native-paper';
import CustomAppBar from '../components/CustomProviderBar';
import { useUser } from '../UserContext';

const ProviderDashboardScreen = ({ route, navigation }) => {
    const { userInfo } = useUser();
    const [upcomingGigs, setUpcomingGigs] = useState([]); // Placeholder state for upcoming gigs
    console.log(userInfo);

    useEffect(() => {
      // Fetch your upcoming gigs here and set them with setUpcomingGigs
      // This is just a placeholder; you'll need to replace it with actual fetch logic
      // const fetchUpcomingGigs = async () => {
      //   const gigs = await fetchGigsAPI(); // Your API call here
      //   setUpcomingGigs(gigs);
      // };
      // fetchUpcomingGigs();
    }, []);
  
  const socialIcons = {
    facebook: 'facebook',
    instagram: 'instagram',
    // Add more mappings as needed
  };

  return (
    <>
    <CustomAppBar 
      navigation={navigation} 
      userInfo={userInfo} 
      currentScreen="ProviderDashboard" // Adjust this value based on the current screen
    />
    
    <ScreenLayout >
      <View style={styles.profileSection}>
        <Image source={{ uri: userInfo.profilePicture }} style={styles.profilePic} />
        <Text style={styles.name}>{userInfo.firstName} </Text>
        <Text style={styles.bio}>{userInfo.activity.name}</Text>
        
        {userInfo.socialMedia.map((social, index) => (
    <View  key={index} style={styles.socialMediaItem}>
      <Icon name={socialIcons[social.platform__icon_name]} size={24} color="black" />
      <Text style={styles.socialMediaText}>{social.username}</Text>
    </View>
))}
        <View style={styles.contactItem}>
        <Icon name="email" size={24} color="black" />
        <Text style={styles.contact}>{userInfo.email}</Text>
        </View>

        <View style={styles.contactItem}>
        <Icon name="phone" size={24} color="black" />
        <Text style={styles.contact}>{userInfo.phoneNumber}</Text>
</View>

      </View>

      
      <View style={{paddingHorizontal: 20, paddingTop: 10}}>
    <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>Your Upcoming Gigs</Text>
    {upcomingGigs.length > 0 ? (
      upcomingGigs.map((gig, index) => (
        <View key={index} style={{marginBottom: 10}}>
          <Text style={{fontSize: 16}}>{gig.title}</Text>
          <Text style={{fontSize: 14, color: 'gray'}}>{gig.date}</Text>
          {/* Add more gig details as needed */}
        </View>
      ))
    ) : (
      <Text style={{fontSize: 14, color: 'gray'}}>No upcoming gigs found.</Text>
    )}
  </View>
    </ScreenLayout>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:20,
  },
  
  profileSection: {
    alignItems: 'center',
    marginBottom: 10, // Reduced from 20
  },
  profilePic: {
    width: 100, // Reduced from 120
    height: 100, // Reduced from 120
    borderRadius: 50, // Adjusted for the smaller size
    marginBottom: 5, // Reduced from 10
  },
  name: {
    fontSize: 18, // Slightly smaller
    fontWeight: 'bold',
    marginBottom: 2, // Reduced from 5
  },
  bio: {
    textAlign: 'center',
    marginBottom: 5, // Reduced from 10
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Reduced from 20
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Reduced from 10
  },
  socialMediaText: {
    marginLeft: 5, // Reduced for compactness
  },
});

export default ProviderDashboardScreen;
