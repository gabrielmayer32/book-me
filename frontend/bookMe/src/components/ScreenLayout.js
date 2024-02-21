import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import CustomTopBar from './CustomBar';


const ScreenLayout = ({ title, onProfilePress, showBackButton, children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomTopBar onProfilePress={onProfilePress} title={title} showBackButton={showBackButton} />
        {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  content: {
    flexGrow: 1,
    // justifyContent: 'space-between',
    // Add any style you want for the scroll view content container
  },
});

export default ScreenLayout;
