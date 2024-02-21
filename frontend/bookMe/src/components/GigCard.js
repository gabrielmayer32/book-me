import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GigCard = ({ dayOfMonth, title, startTime, remainingSlots, address }) => {
  return (
    <View style={styles.gigCardContainer}>
      <View style={styles.dateSquare}>
        <Text style={styles.dateText}>{dayOfMonth}</Text>
      </View>
      
      <View style={styles.gigDetails}>
        <Text style={styles.gigItemTitle}>{title}</Text>
        <View style={styles.detailRow}>
          <Icon name="map" size={20} color="#4F8EF7" />
          <Text style={styles.detailText}>{address} </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-start" size={20} color="#4F8EF7" />
          <Text style={styles.detailText}>{startTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="account-group" size={20} color="#4F8EF7" />
          <Text style={styles.detailText}>{remainingSlots} slots remaining</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gigCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    padding: 10,
  },
  dateSquare: {
    width: 50,
    height: 70,
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
