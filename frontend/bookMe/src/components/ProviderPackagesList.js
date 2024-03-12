// ProviderPackagesList.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import {BACKEND_URL} from '../../utils/constants/';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importing Icon from react-native-vector-icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../SubscriptionContext'; // Adjust the import path as necessary


const ProviderPackagesList = ({ providerId }) => {
  const [packages, setPackages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedPackage, setSubscribedPackage] = useState(null);  
  const {checkSubscriptionsStatus} = useSubscription(); // Assuming you have a useSubscription hook
  const checkSubscriptionStatus = async () => {
    try {
      const csrfToken = await AsyncStorage.getItem("csrfToken"); // Assuming CSRF token is needed
      const token = await AsyncStorage.getItem("token"); // Assuming you store your auth token
      const response = await fetch(`${BACKEND_URL}/accounts/check-subscription/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRFToken": csrfToken, // Include CSRF token if needed
          "Authorization": `Token ${token}`, // Include Authorization header if needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }

      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
      console.log(data);
      
      // If the user is subscribed, set the subscribedPackage details
      if(data.isSubscribed && data.subscription) {
          setSubscribedPackage(data.subscription); // Assuming 'data.subscription' contains both 'status' and 'package' details
      }
       else {
          setSubscribedPackage(null); // Reset if not subscribed
        }

    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    // Assume you want to change the background color every time you fetch packages
    // This is a simple example to cycle through colors based on the length of packages
    setColorIndex(packages.length % colors.length);
  }, [packages]);

  useEffect(() => {
    
  
    checkSubscriptionStatus();
  }, [providerId]); // Dependency array, re-run effect if providerId changes
  
  
  useEffect(() => {
    const fetchProviderPackages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/accounts/packages/provider/${providerId}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch provider packages');
        }
        const data = await response.json();
        setPackages(data.results);
      } catch (error) {
        console.error('Error fetching provider packages:', error);
      }
    };

    fetchProviderPackages();
  }, [providerId]);

  const handleGetPackagePress = async (item) => {
    try {
        setSelectedPackageId(item.id);
        const response = await fetch(`${BACKEND_URL}/accounts/payment-info/provider/${providerId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment information');
      }
      console.log(packages)
      const data = await response.json();
      setSelectedPaymentInfo(data); 
      setSelectedPackageId(item.id);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching payment information:', error);
    }
  };

  const subscribeToPackage = async (packageId) => {
    const csrfToken = await AsyncStorage.getItem("csrfToken");
    try {
      const response = await fetch(`${BACKEND_URL}/accounts/packages/subscribe/${packageId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRFToken": csrfToken,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe to package');
      }
      
      const data = await response.json();
      alert(data.message); // Show success message
      // Assuming data contains the subscription details, you might need to adjust based on actual response
      // setSubscribedPackage(data.subscription); // Uncomment and adjust according to your data structure
      setIsSubscribed(true);
      setModalVisible(false);
      await checkSubscriptionsStatus(); // Refresh the subscriptions list

  
    } catch (error) {
      console.error('Error subscribing to package:', error);
      alert(error.message);
    }
  };
  

  const colors = [
    '#5A5D9E', // Slightly lighter
    '#7377BF', // Even lighter
    '#898AC0', // Soft variation
    '#9FA0C3', // Lightest variation
  ];
  // {backgroundColor: colors[colorIndex]}]}>  

  return (
    <View style={styles.fullComponent}>
      {isSubscribed && subscribedPackage ? (
        <>
            <Text style={styles.subscribedPackageTitle}>Subscribed Package</Text>
            <View style={styles.packageItem}>
          <View style={styles.detailRow}>
            <Text style={styles.packageName}>{subscribedPackage.package.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.redText}>{subscribedPackage.package.duration} days left</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.text}>Remaining booking(s): {subscribedPackage.package.number_of_bookings}</Text>
          </View>
          {/* Display the subscription status */}
          <View style={styles.detailRow}>
            <Text style={styles.text}>Status: {subscribedPackage.status}</Text>
          </View>
          {isSubscribed && subscribedPackage.status === 'confirmed' && (
                        <Text style={styles.modalText}>All future bookings will be deducted from this package</Text>
                    )}

        
        </View>
        </>
      ) : (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {packages.map((item) => (
            <View key={item.id.toString()} style={styles.packageItem}>
              <View style={styles.detailRow}>
                <Text style={styles.packageName}>{item.name}</Text>
              </View>

              <View style={styles.detailRow}>
              <Text style={styles.price}>Rs. </Text>
                <Text style={styles.price}>{item.formatted_price}</Text>
              </View>

              <View style={styles.detailRow}>
                 <Icon name="information" size={20} color="#555" />
                <Text style={styles.text}>{item.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="account-group" size={20} color="#555" />
                <Text style={styles.text}>{item.number_of_bookings} sessions</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="calendar-range" size={20} color="#555" />
                <Text style={styles.text}>Available for {item.duration} days*</Text>
              </View>
              
  
              <TouchableOpacity style={styles.button} onPress={() => handleGetPackagePress(item)}>
                <Text style={styles.buttonText}>Get Package</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        
      )}
      {isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Accepted Payment Methods</Text>
            {selectedPaymentInfo && (
                <>
                  {selectedPaymentInfo.accepts_cash && <Text style={styles.modalPayment}>Cash in hand</Text>}
                  {selectedPaymentInfo.mcb_juice_number && <Text style={styles.modalPayment}>MCB Juice: {selectedPaymentInfo.mcb_juice_number}</Text>}
                  {selectedPaymentInfo.internet_banking_details && <Text style={styles.modalPayment}>Internet Banking Details: {selectedPaymentInfo.internet_banking_details}</Text>}
                  {selectedPaymentInfo.accepts_card && <Text style={styles.modalPayment}>Accepts Card Payments</Text>}
                </>
              )}
                <Text style={styles.modalText}>The payment has to be made before your package get approved.  </Text>
                <Text style={styles.modalText}>You can take only one package at a time. </Text>
                <Text style={styles.modalText}>You can't unsubscribe. </Text>
            <TouchableOpacity style={styles.button} onPress={() => subscribeToPackage(selectedPackageId)}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
          </View>
          </View>
        </Modal>
      )}
    </View>
  );
  
};




const styles = StyleSheet.create({
    container: {
      marginTop: 20,
      
    },
    subscribedPackageTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#000', // Choose a suitable color
        marginTop: 20, // Optional: add some space above the title
      },
    contentContainer: {
      paddingHorizontal: 10,
    },
    fullComponent: {
        flex: 1, // Ensure the component fills the whole screen
        
      },
    fullScreenBackdrop: {
        position: 'absolute', // Position the backdrop absolutely
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
      },
      centeredView: {
        justifyContent: "center",
        alignItems: "center",
      },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        },
        modalPayment: {
            fontSize: 16,
            fontWeight: 'bold',
        marginBottom: 5,
        },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },

      modalText: {
        marginTop: 5,
        fontStyle: 'italic',
        fontSize: 14,
      },
    packageItem: {
      backgroundColor: '#f9f9f9',
      padding: 30,
      borderRadius: 5,
      marginTop: 10,
      marginHorizontal: 15,
      marginBottom: 10,
      width: 300,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    Redtext : {
        fontFamily: 'Roboto',
        color: 'red',
        },

    text: {
        marginLeft: 5,
    },
    price : {
      fontWeight: 'bold',
      fontSize: 22,
      marginBottom: 5,
    },
    packageName: {
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 10,
    },
    button: {
    alignContent: 'center',
    alignItems: 'center',
      marginTop: 10,
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
    },
    // Add more styles as needed
  });

export default ProviderPackagesList;