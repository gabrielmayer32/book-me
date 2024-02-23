import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GigCard = ({ dayOfMonth, title, startTime, endTime, remainingSlots, address, onBookPress }) => {
    
    return (
      <View style={styles.gigCardContainer}>
        <View style={styles.dateSquare}>
          <Text style={styles.dateText}>{dayOfMonth}</Text>
        </View>
        
        <View style={styles.gigDetails}>
          <Text style={styles.gigItemTitle}>{title}</Text>
          <View style={styles.detailRow}>
            <Icon name="map" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="clock-start" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{startTime} - {endTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="account-group" size={20} color="#4F8EF7" />
            <Text style={styles.detailText}>{remainingSlots} slots remaining</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={onBookPress}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    );
  };
  

const styles = StyleSheet.create({
    gigCardContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#FFF",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 4,
        marginBottom: 10,
        position: 'relative', // Add this line
      },
      bookButton: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: '#4F8EF7',
        padding: 10,
        borderRadius: 20,
      },
      bookButtonText: {
        color: 'white',
        fontSize: 16,
      },
  dateSquare: {
    width: 50,
    height: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gigDetails: {
    flex: 1,
  },
  gigItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
  },
});

export default GigCard;
