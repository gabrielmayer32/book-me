import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Text, View, FlatList } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import CustomAppBar from '../components/CustomProviderBar';
import { useUser } from '../UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon
import { Swipeable } from 'react-native-gesture-handler';
import { BACKEND_URL } from '../../utils/constants';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const TemplatesScreen = ({ route, navigation }) => {
    const { userInfo } = useUser();
    const [templates, setTemplates] = useState([]);
    const handleDeleteTemplate = async (templateId) => {
        // Delete template logic here
        console.log(`Deleting template with ID: ${templateId}`);
        // For demonstration purposes, replace with your actual delete logic
        try {
            const response = await fetch(`${BACKEND_URL}/gig/update-template-status/${templateId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers such as authorization headers
                },
            });
            if (response.ok) {
                // If deletion was successful, refresh the templates list
                fetchTemplates();
            } else {
                console.error('Failed to delete template');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const fetchTemplates = useCallback(async () => {
        // Your logic to fetch templates goes here
        // For demonstration, let's assume you set the fetched templates to state
        try {
            const response = await fetch(`${BACKEND_URL}/gig/templates/`, {
                method: 'GET',
                headers: {
                    // Include headers as required, e.g., for authentication
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setTemplates(data);
            } else {
                console.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTemplates();
        }, [fetchTemplates])
    );

const SwipeableTemplateItem = ({ item, onDelete, navigation }) => {
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
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    };
  
    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleTemplatePress(item)}>
          <Icon name="file-document-outline" size={24} color="#4F8EF7" />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  
      

    const handleTemplatePress = (template) => {
      // Navigate to Calendar screen with template data
      navigation.navigate('Calendar', { templateData: template });
    };
    
    return (
        <>
          <CustomAppBar navigation={navigation} userInfo={userInfo} currentScreen="Templates" />
          <ScreenLayout>
            <FlatList
              data={templates}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <SwipeableTemplateItem
                  item={item}
                  onDelete={handleDeleteTemplate}
                />
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