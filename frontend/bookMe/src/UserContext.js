// In UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0); // Make sure this is correctly initialized

  const incrementNotificationCount = () => {
    setNotificationCount((prevCount) => prevCount + 1);
  };

  const resetNotificationCount = () => {
    setNotificationCount(0); // Reset the count to 0
  };

  // Ensure notificationCount is included here
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, notificationCount, incrementNotificationCount,resetNotificationCount  }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
