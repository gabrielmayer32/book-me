import React, { useState, useEffect } from 'react';
import { View, Text, Button , TouchableOpacity, Image, ScrollView, FlatList, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../utils/useFetch';
import CustomTopBar from '../components/CustomBar';
import ScreenLayout from '../components/ScreenLayout'; // Adjust the import path as necessary
import { act } from 'react-test-renderer';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useFetch('http://127.0.0.1:8000/accounts/providers/');
  console.log(data);
  if (isLoading) return <ScreenLayout title="Loading..."><Text>Loading...</Text></ScreenLayout>;
  if (error) return <ScreenLayout title="Error"><Text>Error: {error}</Text></ScreenLayout>;

  const handlePress = (item) => {
    // Assuming item.socials is an array of { platform, url, icon }
    navigation.navigate('ProfileDetails', {
      providerId: item.id, 
      firstName: item.first_name,
      bio: item.bio,
      age: item.age, 
      activity: item.activity, 
      phoneNumber: item.phone_number, // Assuming you have phone number data
      profileImageUrl: item.profile_picture, // Assuming you have profile image URL
      socials: item.socials, // Directly pass the socials array received from your backend
    });
  };

  return (
    <ScreenLayout title="Home">
      <Image source={require('../../assets/images/1.jpg')} style={styles.topImage} />
      <Text style={styles.collaboratorsTitle}>Our Collaborators</Text>
      <FlatList
        data={data?.providers}
        horizontal={true}
        keyExtractor={item => item.id.toString()} // Ensure keyExtractor uses a string
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.profile_picture }} style={styles.avatar} /> 
              <Text style={styles.name}>{item.first_name}</Text>
              <Text style={styles.activity}>{item.activity}</Text>

            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenLayout>
  );
};
  
  const styles = StyleSheet.create({
    topImage: {
      width: '90%', // Maintains the width at 80% of its container's width
      height: 200, // Adjust height as needed
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

    centeredView: {
      alignItems: 'center',
      marginTop: 20,
    },
  });
  
  
  export default HomeScreen;
  