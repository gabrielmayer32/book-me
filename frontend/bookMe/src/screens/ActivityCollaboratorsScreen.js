import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import ScreenLayout from '../components/ScreenLayout';
import { useUser } from '../UserContext';

const { width } = Dimensions.get('window');
const numColumns = 3; // Number of columns in the grid
const imageSize = width / numColumns; // Calculate the size of the image to fit 3 in a row

const ActivityCollaboratorsScreen = ({ route, navigation }) => {
    const { activityId, providerDetails } = route.params;
    const { providerId, businessName, activity, age, phoneNumber, socials, profileImageUrl } = route.params;
    const {userInfo} = useUser();
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    const fetchCollaboratorsAndDetails = async () => {
      try {
        // Fetch collaborators based on activityId
        const collabResponse = await axios.get(`http://127.0.0.1:8000/accounts/activities/${activityId}/collaborators/`);
        // You might fetch additional details here or in ProfileDetailsScreen based on providerId
        setCollaborators(collabResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchCollaboratorsAndDetails();
  }, [activityId]);
  

  const handleCollaboratorPress = (collaborator) => {
    const selectedProviderDetails = providerDetails.find(detail => detail.providerId === collaborator.id);
    if (selectedProviderDetails) {
      navigation.navigate('ProfileDetails', selectedProviderDetails);
    }
  };

  const renderCollaboratorItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCollaboratorPress(item)} style={styles.collaboratorItem}>
      <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
      <Text style={styles.name}>{item.username}</Text>
      <Text style={styles.detail}>{item.business_name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout title="Collaborators" showBackButton={true}>
      <FlatList
        data={collaborators}
        renderItem={renderCollaboratorItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={[styles.container, collaborators.length === 1 ? styles.singleItem : {}]}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    // Add flexGrow and justifyContent only if you need to keep items to the top left for a single item scenario
  },
  singleItem: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start', // Align items to the left
  },
  collaboratorItem: {
    alignItems: 'center',
    width: imageSize,
    padding: 10,
  },
  avatar: {
    width: imageSize - 20,
    height: imageSize - 20,
    borderRadius: (imageSize - 20) / 2,
    marginBottom: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  detail: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ActivityCollaboratorsScreen;
