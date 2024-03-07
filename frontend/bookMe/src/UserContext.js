// In UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/constants';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const decrementNotificationCount = () => {
    setNotificationCount((currentCount) => currentCount - 1);
    // Optionally, persist this count to AsyncStorage or backend
  };
  // Define fetchNotificationsCount as a function inside UserProvider
  const fetchNotificationsCount = async () => {
    if (!userInfo) return; // Exit if no user is logged in

    try {
      const response = await fetch(`${BACKEND_URL}/accounts/notifications/count/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { count } = await response.json();
        setNotificationCount(count);
      } else {
        console.error('Failed to fetch notification count');
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch notification count when userInfo changes and is not null
  useEffect(() => {
    if (userInfo) {
      fetchNotificationsCount();
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{
      userInfo, 
      setUserInfo, 
      decrementNotificationCount,
      notificationCount, 
      incrementNotificationCount: () => setNotificationCount(prevCount => prevCount + 1), 
      resetNotificationCount: () => setNotificationCount(0),
      fetchNotificationsCount, // Now including fetchNotificationsCount in the context value
    }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => useContext(UserContext);
