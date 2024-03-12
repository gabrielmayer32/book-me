import React, { useState, useEffect } from 'react';
import { View, Text,  TouchableOpacity, Image, ScrollView, FlatList, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../utils/useFetch';
import CustomTopBar from '../components/CustomBar';
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import { act } from 'react-test-renderer';
import { useUser } from '../UserContext';
import axios from 'axios';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BACKEND_URL} from '../../utils/constants/';
import CachedImage from 'expo-cached-image';
import Theme from '../theme/theme';
import { useSubscription } from '../SubscriptionContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useFetch(`${BACKEND_URL}/accounts/providers/`);
  const [weather, setWeather] = useState({ temp: null, icon: null });
  const [activities, setActivities] = useState([]); // State for activities
  const { checkSubscriptionsStatus } = useSubscription();
  const { setUserInfo, fetchNotificationsCount } = useUser();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/accounts/activities/`); // Adjust URL as needed
        setActivities(response.data); // Assuming the response structure
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

  


    fetchActivities();
    // fetchNotificationsCount(); // Fetch notifications count
  }, []);

  useEffect(() => {
    checkSubscriptionsStatus();
    fetchNotificationsCount();
    console.log('li eme');
    // Any other actions to run once on component mount
  }, []); // Empty dependency array means this effect runs only on mount and unmount
  

  // Existing code for weather and other functionalities...
  const baseURL = `${BACKEND_URL}`;
  const renderActivities = () => {
    return (
      <ScrollView style={{ flex: 1 }}>

    
      <FlatList
        data={activities}
        horizontal={true}
        keyExtractor={item => item.id.toString()}
        
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {
            navigation.navigate('ActivityCollaborators', { 
              activityId: item.id,
              // Assuming these details are available and correctly named in your current context
              providerDetails: data?.providers.map(provider => ({
                providerId: provider.id,
                businessName: provider.businessName,
                activity: provider.activity,
                age: provider.age,
                phoneNumber: provider.phone_number,
                profileImageUrl: provider.profile_picture,
                socials: provider.socials,
              }))
            });
          }}>
          <View style={styles.activityContainer}>
            
            <Image source={{ uri: baseURL + item.image, cache: 'force-cache'  }} style={styles.activityImage} />
            <Text style={styles.activityName}>{item.name}</Text>
          </View>
        </TouchableOpacity>
        )}
        style={styles.activitiesList} 
        showsHorizontalScrollIndicator={false}
      />
         </ScrollView>
    );
  };
  
    const getWeatherIcon = (iconCode) => {
      const mapping = {
        '01d': 'weather-sunny',
        '01n': 'weather-night',
        '02d': 'weather-partly-cloudy',
        '02n': 'weather-night-partly-cloudy',
        '03d': 'weather-cloudy',
        '03n': 'weather-cloudy',
        '04d': 'weather-cloudy',
        '04n': 'weather-cloudy',
        '09d': 'weather-rainy',
        '09n': 'weather-rainy',
        '10d': 'weather-pouring',
        '10n': 'weather-pouring',
        '11d': 'weather-lightning',
        '11n': 'weather-lightning',
        '13d': 'weather-snowy',
        '13n': 'weather-snowy',
        '50d': 'weather-fog',
        '50n': 'weather-fog',
      };
    
      return mapping[iconCode] || 'weather-sunny'; // Default to 'weather-sunny' if no match is found
    };

    const { userInfo } = useUser();
    const userName = userInfo?.firstName || 'User';

    const fetchWeather = async () => {

      
      const apiKey = '32cd2bacbb63068b58a349971751f5ba';
      // Use trip details for latitude and longitude
      const lat = -20.348404
      const lon = 57.552152
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      // const url = 'https://api.openweathermap.org/data/2.5/weather?lat=-20.33&lon=57.38&appid=32cd2bacbb63068b58a349971751f5ba&units=metric';
      // console.log(url_bis);
      try {
        const response = await axios.get(url);
        var { temp } = response.data.main;
        temp = temp.toFixed(0);
        const icon = response.data.weather[0].icon;
        setWeather({ temp, icon });
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    const greeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };


    useEffect(() => {
      fetchWeather();
    }, [userInfo]);

  const handlePress = (item) => {

    navigation.navigate('ProfileDetails', {
      providerId: item.id, 
      firstName: item.first_name,
      businessName: item.businessName,
      bio: item.bio,
      age: item.age, 
      activity: item.activity, 
      phoneNumber: item.phone_number, 
      profileImageUrl: item.profile_picture, 
      socials: item.socials,
      is_subscribed: item.is_subscribed,
    });
  };

  if (isLoading) return <ScreenLayout title="Loading..."><Text>Loading...</Text></ScreenLayout>;
  if (error) return <ScreenLayout title="Error"><Text>Error: {error}</Text></ScreenLayout>;


  return (
    <ScrollView style={{ flex: 1 }}>

    <View>
      <Text style={styles.collaboratorsTitle}>{`${greeting()}, ${userName} `}</Text>
                <View style={styles.weatherContainer}>
                {weather.temp && (
        <View style={{ flexDirection: 'row', marginLeft:10, alignItems: 'center' }}>
          {weather.icon && (
            <Icon
            name={getWeatherIcon(weather.icon)}
            size={24} // You can adjust the size as needed
            color="#000" // You can adjust the color as needed
          />
          )}
          <Text style={styles.weatherText}>{` | ${weather.temp}°C`}  </Text>

        </View>
      )}
                  </View>
      <Image source={require('../../assets/images/1.jpg')} style={styles.topImage} />
      {/* <TouchableOpacity style={styles.createButton} onPress={navigateToCreateGig}> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton}>
          <Icon name="account" size={20} color="white" />
          <Text style={styles.createButtonText}>Become a collaborator</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.collaboratorsTitle}>Activities</Text>

      {renderActivities()} 

      <Text style={styles.collaboratorsTitle}>Our Collaborators</Text>
      <FlatList
        data={data?.providers}
        horizontal={true}
        keyExtractor={item => item.id.toString()} // Ensure keyExtractor uses a string
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.profile_picture , cache: 'force-cache' }} resizeMode='cover' style={styles.avatar} /> 
              <Text style={styles.name}>{item.businessName}</Text>
              <Text style={styles.activity}>{item.activity}</Text>

            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  </ScrollView>
  );
};
  
  const styles = StyleSheet.create({
    activityContainer: {
      alignItems: 'center',
      marginRight: 15,
      padding: 10,
    },
    buttonContainer : {
      alignItems: 'center',
      marginTop: 10,
    },
    activityImage: {
      width: 120, // Adjust based on your design
      height: 80, // Adjust based on your design
      borderRadius: 10, // Rounded corners
      marginBottom: 5,
    },
    activityName: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    topImage: {
      width: '95%', // Maintains the width at 80% of its container's width
      height: 150, // Adjust height as needed
      alignSelf: 'center', // Centers the image horizontally within the ScrollView
      borderRadius: 20, // Adjust this value to control the roundness of the corners
      marginTop: 20, // Optional: adds some space at the top, adjust as needed
      marginBottom: 20, // Optional: adds some space below the image, adjust as needed
    },
    collaboratorsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
      marginLeft: 10, // For some spacing from the screen edge
    },
    avatarContainer: {
      alignItems: 'center',
      marginRight: 15,
      padding: 10,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35, // This makes the image rounded
      borderWidth: 2,
      borderColor: '#fff',
    },
    name: {
      marginTop: 5,
      fontSize: 16,
      fontWeight: 'bold',
    },
    activity: {
      fontSize: 14,
      color: '#666',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Theme.colors.secondary,
      padding: 10,
      borderRadius: 10,
      justifyContent: 'center',
      width: 300,
    },
    createButtonText: {
      color: 'white',
      marginLeft: 5,
    },

    centeredView: {
      alignItems: 'center',
      marginTop: 20,
    },
  });
  
  
  export default HomeScreen;
  