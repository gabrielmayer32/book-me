import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext'; // Adjust the import path as necessary
import { BACKEND_URL } from '../utils/constants';

const SubscriptionContext = createContext({
  subscriptions: [], // Initialize with an empty array
  setSubscriptions: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const { userInfo } = useUser(); // Use the useUser hook to access userInfo

  // Define checkSubscriptionsStatus outside of useEffect so it can be exposed
  const checkSubscriptionsStatus = async () => {
    if (!userInfo) return; // Exit if userInfo is not available

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BACKEND_URL}/accounts/check-subscriptions-status/${userInfo.id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log("Fetched subscriptions:", data);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error checking subscriptions status:', error);
    }
  };

  // // Call checkSubscriptionsStatus when userInfo changes
  // useEffect(() => {
  //   checkSubscriptionsStatus();
  // }, [userInfo, checkSubscriptionsStatus]);

  return (
    <SubscriptionContext.Provider value={{ subscriptions, setSubscriptions, checkSubscriptionsStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
