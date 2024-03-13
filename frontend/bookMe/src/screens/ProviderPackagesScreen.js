import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Ensure you have @react-navigation/native installed
import { useUser } from '../UserContext';
import CustomAppBar from '../components/CustomProviderBar';
import ScreenLayout from '../components/ScreenLayout';
import { Alert } from 'react-native';
import {BACKEND_URL} from '../../utils/constants/';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const colors = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176']; // Example color set


const ProviderPackagesScreen = () => {
  const [packages, setPackages] = useState([]);
  const navigation = useNavigation(); // Use useNavigation hook to get the navigation prop
  const { userInfo } = useUser();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null);
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [isSubscriberModalVisible, setIsSubscriberModalVisible] = useState(false);

  const deletePackage = async (packageId) => {
    const csrfToken = await AsyncStorage.getItem('csrfToken'); // Retrieve the stored token
    try {
      const response = await fetch(`${BACKEND_URL}/accounts/delete_package/${packageId}/`, {
        method: 'DELETE',
        headers: {
          "X-CSRFToken": csrfToken, // Include CSRF token in the request header
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
  
      // On successful deletion, refetch packages
      fetchPackages(); // Assuming fetchPackages is your function to fetch the list of packages
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete the package.");
    }
  };
  
  const handleDeletePackage = async (packageId) => {
    // Call DELETE API
    // Confirm deletion with the user before proceeding
    Alert.alert("Confirm", "Are you sure you want to delete this package?", [
      { text: "Cancel" },
      { text: "Yes", onPress: () => deletePackage(packageId) },
    ]);
  };

  const handleEditPackage = (packageData) => {
    // Navigate to CreatePackageScreen with packageData for editing
    navigation.navigate('CreatePackages', { package: packageData });
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/accounts/package/list/`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      setPackages(data.results);
      console.log('UI')
      console.log(data.results);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch packages.");
    }
  };
  
  useEffect(() => {
    

    fetchPackages();
  }, []);

  
  

  const goToCreatePackageScreen = () => {
    // Navigate to the screen where users can add a new package
    // Replace 'CreatePackageScreen' with the actual screen name you have for adding packages
    navigation.navigate('CreatePackages');
  };

  const SubscriberDetailModal = () => {
    if (!selectedSubscriber) return null;
  
    return (
      <Modal
        visible={isSubscriberModalVisible}
        transparent={true} // Make the modal transparent
        onRequestClose={() => setIsSubscriberModalVisible(false)}
        animationType="slide" // Optional: add some animation
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>First Name: {selectedSubscriber.first_name}</Text>
            <Text>Last Name: {selectedSubscriber.last_name}</Text>
            <Text>Phone Number: {selectedSubscriber.phone_number}</Text>
            {/* Other subscriber details */}
            <Button title="Close" onPress={() => setIsSubscriberModalVisible(false)} />
          </View>
        </View>
      </Modal>
    );
  };




  const PackageItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  
    const totalSubscribers = item.subscribers.length;
    const visibleSubscribers = item.subscribers.slice(0, 3);
    const remainingCount = totalSubscribers - visibleSubscribers.length;

    const handleUnsubscribeUser = async (subscriptionId) => {
      const csrfToken = await AsyncStorage.getItem('csrfToken');

  try {
        const response = await fetch(`${BACKEND_URL}/accounts/package/unsubscribe/${item.id}/${selectedSubscriber.id}/`, {
          method: 'POST',
          headers: {
            "X-CSRFToken": csrfToken, 
          },
        });
        if (!response.ok) {
          throw new Error('Failed to unsubscribe user');
        }
        fetchPackages();
        setSelectedSubscriber(null);
        Alert.alert("Success", "User has been unsubscribed.");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message);
      }
    };
    

    const handleAvatarPress = (subscriber) => {
      // Toggle selection: If the same subscriber is selected again, deselect it
      if (selectedSubscriber && selectedSubscriber.id === subscriber.id) {
        setExpanded(null);
        setSelectedSubscriber(null);
      } else {
        setSelectedSubscriber(subscriber);
        console.log(subscriber);
      }
    };
  
    const handleExpandClick = () => {
      setExpanded(!expanded);
      // Deselect subscriber when expanding/collapsing the list
      setSelectedSubscriber(null);
    };

    
    

    return (
      <View style={styles.packageItem}>
        <Text style={styles.packageName}>{item.name}</Text>
        
      <Text style={styles.subscribedUsers}>Users </Text> 
      
             

        {/* Subscriber avatars */}
        <View style={styles.subscribersContainer}>
          {visibleSubscribers.map((subscriber, index) => (
            
            <TouchableOpacity key={subscriber.id} onPress={() => handleAvatarPress(subscriber)} style={[styles.subscriberAvatar, { backgroundColor: colors[index % colors.length] }]}>
            <Text style={styles.subscriberLetter}>{subscriber.first_name[0]}</Text>
            </TouchableOpacity>
          ))}
          {!expanded && remainingCount > 0 && (
          <TouchableOpacity onPress={handleExpandClick} style={[styles.subscriberAvatar, { backgroundColor: colors[(item.subscribers.slice(0, 3).length) % colors.length] }]}>
          <Text style={styles.subscriberLetter}>+{remainingCount}</Text>
            </TouchableOpacity>
          )}
        </View>
        {expanded && remainingCount > 0 && item.subscribers.slice(3).map((subscriber, index) => (
          <View key={index} style={styles.expandedSubscriber}>
            <TouchableOpacity onPress={() => handleAvatarPress(subscriber)} style={styles.subscriberAvatar}>
              <Text style={styles.subscriberLetter}>{subscriber.first_name[0]}</Text>
            </TouchableOpacity>
          </View>
        ))}
{selectedSubscriber && (
  <View style={styles.subscriberDetails}>
    <Text style={styles.firstName}> {selectedSubscriber.first_name} {selectedSubscriber.last_name}</Text>
    <Text> {selectedSubscriber.email}</Text>
    <Text> {selectedSubscriber.phone_number}</Text>
    <Text>Bookings Remaining: {selectedSubscriber.subscription_details.remaining_bookings}</Text> 
    <Text>Subscribed At: {selectedSubscriber.subscription_details.start_date}</Text> 
    <Button
      title="Unsubscribe User"
      onPress={() => handleUnsubscribeUser(selectedSubscriber.subscription_id)}
    />  
    </View>
)}

      </View>
    );
  };

  return (
    <>
   <CustomAppBar navigation={navigation} userInfo={userInfo} currentScreen="ProviderPackages" />
    <ScreenLayout>
      <Button title="Add Package" onPress={goToCreatePackageScreen} />
      <Text style={styles.title}>Your packages </Text>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    <FlatList
      data={packages}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.packageItemBis}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Rs {item.price}</Text>
          <Text>{item.number_of_bookings} bookings</Text>
          <Text>For {item.duration} days</Text>
      <Button title="Delete" onPress={() => handleDeletePackage(item.id)} />

        </View>
        
      )}
    />
  </View>

  <View style={{ flex: 1 }}>
    
  <Text style={styles.title}>Your active packages </Text>
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PackageItem item={item} />}
    />
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
  subscribedUsers : {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Partially transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Set a fixed width or use a percentage
    // Optionally, set a fixed height or minHeight
  },
  packageItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginTop: 10,
    borderRadius: 5,
  },
  packageItemBis: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    margin: 10,
    marginTop: 10,
    height: 200,
    width: 200,
    borderRadius: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft:20,
  },
  subscribersContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  packageList: {
    height: 100,
  },
  screen: {
    flex: 1,
    flexDirection: 'column', // Use column to align items vertically
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
},
detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
},

  packageName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  subscribersContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  subscriberAvatar: {
    marginRight: -5,
    width: 30,
    height: 30,
    borderRadius: 15,

    backgroundColor: '#64b5f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  subscriberLetter: {
    color: '#fff',
    fontWeight: 'bold',
  },
  moreSubscribers: {
    fontWeight: 'bold',
  },
  expandedContainer: {
    marginTop: 10,
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  packageList: {
    flex: 3,
  },
  subscriberDetails: {
    flex: 2,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },



});

export default ProviderPackagesScreen;
