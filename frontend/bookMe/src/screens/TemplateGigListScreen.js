import React, {useState, useEffect} from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import CustomAppBar from '../components/CustomProviderBar';
import { useUser } from '../UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon



const TemplatesScreen = ({ route, navigation }) => {
    const { templates } = route.params;   
    const { userInfo } = useUser();

    const handleTemplatePress = (template) => {
      // Navigate to Calendar screen with template data
      navigation.navigate('Calendar', { templateData: template });
    };

    return (
        <>
        <CustomAppBar 
            navigation={navigation} 
            userInfo={userInfo} 
            currentScreen="Templates" // Make sure this matches your screen name or desired title
        /> 
        <ScreenLayout>
            <FlatList
                data={templates}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => handleTemplatePress(item)}>
                        <Icon name="file-document-outline" size={24} color="#4F8EF7" />
                        <View style={styles.textContainer}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </ScreenLayout>
        </>
    );
    
};

const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    textContainer: {
      marginLeft: 10,
      flex: 1, // This ensures the text container takes up the remaining space
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 'bold', // Optional: if you want the title to be bold
      color: '#333',
    },
    itemDescription: {
      fontSize: 14,
      color: '#666',
    },
    
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default TemplatesScreen;