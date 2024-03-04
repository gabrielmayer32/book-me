import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../utils/constants/';
import { Swipeable } from 'react-native-gesture-handler';
import { Image } from 'react-native'; // Import Image component
import { Dimensions } from 'react-native'; // Import Dimensions
import moment from 'moment'; // Import moment
import { useUser } from '../UserContext';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

         




const SwipeableNotificationItem = ({ item, onDelete }) => {
  const swipeableRef = React.useRef(null); 

  const timeAgo = item.timestamp ? moment(item.timestamp).fromNow() : '';

  const handleSwipeableRightOpen = () => {
    // Optimistically remove the item from the UI
    onDelete(item.id);
    // Optionally, close the swipeable item
    swipeableRef.current?.close();
  };

  const markNotificationsAsRead = async () => {
    const csrfToken = await AsyncStorage.getItem('csrfToken');
  
    // Assuming you have an endpoint like '/accounts/notifications/mark-read/' to mark all notifications as read
    fetch(`${BACKEND_URL}/accounts/notifications/mark-as-read/`, {
      method: 'PUT', // or 'PATCH' depending on your backend
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.ok) {
        console.log('Notifications marked as read');
        // Optionally, you can fetch notifications again here to update the UI
        // fetchNotifications();
      } else {
        console.error('Failed to mark notifications as read');
      }
    })
    .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    // When the component loses focus, mark notifications as read
    
        markNotificationsAsRead();
     
  }, []);
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={swipableStyles.deleteButton}
        >
          <Text style={swipableStyles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const deleteThreshold = screenWidth * 0.75;

  const handleSwipeableOpen = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close(); 
    }
    onDelete(item.id);
  };

  return (
    <Swipeable
    ref={swipeableRef}
    renderRightActions={renderRightActions}
    onSwipeableRightOpen={handleSwipeableRightOpen}
  >  
  <View style={swipableStyles.notificationItem}>
        <View style={swipableStyles.leftContainer}>
        {item.unread && <View style={swipableStyles.unreadIndicator} />}
          <Image source={{ uri: item.profile_picture_url }} style={swipableStyles.profilePic} />
        </View>
        <View style={swipableStyles.contentContainer}>
          <Text style={swipableStyles.notificationTextUser}>{item.actor}</Text>
          <Text style={swipableStyles.notificationText}>{item.description}</Text>
        </View>
        <Text style={swipableStyles.timeAgo}>{item.timeAgo}</Text>
      </View>
    </Swipeable>
  );
};

const swipableStyles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    backgroundColor: 'white',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  unreadIndicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#4F8EF7',
   
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center', // Center content vertically
  },
  notificationTextUser: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5, // Space between the username and the description
  },
  notificationText: {
    fontSize: 14,
    
  },
  timeAgo: {
    fontSize: 12,
    
    color: '#666',
  },
  // Rest of your styles...
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    height: '100%',
    borderTopLeftRadius: 10, // Rounded border top left
    borderBottomLeftRadius: 10, // Rounded border bottom left
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },


  
});





const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { resetNotificationCount } = useUser(); // Destructure resetNotificationCount from context
  const isFocused = useIsFocused();

  const fetchNotifications = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${BACKEND_URL}/accounts/notifications/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const updatedNotifications = data.map(notification => ({
        ...notification,
        timeAgo: moment(notification.timestamp).fromNow()
      }));
      console.log('Notifications:', updatedNotifications);
      setNotifications(updatedNotifications);
    } else {
      console.error('Failed to fetch notifications');
    }
  };

  

const markNotificationsAsRead = async () => {
  const csrfToken = await AsyncStorage.getItem('csrfToken');

  // Assuming you have an endpoint like '/accounts/notifications/mark-read/' to mark all notifications as read
  fetch(`${BACKEND_URL}/accounts/notifications/mark-as-read/`, {
    method: 'PUT', // or 'PATCH' depending on your backend
    headers: {
      'X-CSRFToken': csrfToken,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (response.ok) {
      console.log('Notifications marked as read');
      // Optionally, you can fetch notifications again here to update the UI
      // fetchNotifications();
    } else {
      console.error('Failed to mark notifications as read');
    }
  })
  .catch(error => console.error('Error:', error));
};

const handleDeleteNotification = async (id) => {
  const token = await AsyncStorage.getItem('userToken'); // Ensure you are storing and retrieving the token correctly
  const csrfToken = await AsyncStorage.getItem('csrfToken');


  fetch(`${BACKEND_URL}/accounts/notifications/delete/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if(response.ok) {
      // Successfully deleted notification
      setNotifications(currentNotifications =>
        currentNotifications.filter(notification => notification.id !== id),
      );
    } else {
      // Handle error response
      console.error('Failed to delete notification');
    }
  })
  .catch(error => console.error('Error:', error));
};


// useEffect(() => {
//   // When the component loses focus, mark notifications as read
//   return () => {
//     if (!isFocused) {
//       markNotificationsAsRead();
//     }
//   };
// }, [isFocused]);
// Run every time the screen gains focus
useFocusEffect(
  React.useCallback(() => {
    fetchNotifications();
    resetNotificationCount();
  }, [resetNotificationCount])
);

return (
  <View style={styles.container}>
    <FlatList
      data={notifications}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <SwipeableNotificationItem
          item={item}
          onDelete={handleDeleteNotification}
        />
      )}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    // borderBottomColor: '#cccccc',
  },
  notificationText: {
    fontSize: 16,
  },
});

export default NotificationScreen;
