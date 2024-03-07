import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomSignupBar = ({ title, onProfilePress, showBackButton = false }) => {
  const navigation = useNavigation(); // Use the useNavigation hook to get access to navigation

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideButton}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideButton} /> // Invisible spacer to balance the title when there's no back button
      )}
      <Text style={styles.title}>Signup</Text>
      <View style={styles.sideButton} /> 
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center items along the main axis
    backgroundColor: 'transparent',
    elevation: 5,
  },
  sideButton: {
    width: 24, // Ensure this matches the icon size or the width of the back button for symmetry
  },
  title: {
    flex: 1, // Allows the title to grow and thus center itself taking into account the spacers
    textAlign: 'center', // Ensures text alignment is centered
    fontWeight: 'bold',
    fontSize: 20,
  },
});


export default CustomSignupBar;