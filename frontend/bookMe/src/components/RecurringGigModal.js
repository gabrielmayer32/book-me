import React, {useState} from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const RecurringGigModal = ({ isVisible, onClose, onSubmit }) => {
  const [durationMonths, setDurationMonths] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Repeat gigs for how long ? (leave blank fields for 1 month of recurring gigs) </Text>
          <TextInput
            style={styles.input}
            placeholder="Months"
            keyboardType="numeric"
            onChangeText={setDurationMonths}
            value={durationMonths}
          />
          <TextInput
            style={styles.input}
            placeholder="Weeks"
            keyboardType="numeric"
            onChangeText={setDurationWeeks}
            value={durationWeeks}
          />
          <Button
            title="Submit"
            onPress={() => onSubmit(durationMonths, durationWeeks)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Partially transparent background
        justifyContent: 'center',
        alignItems: 'center',
      },
      firstName: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      modalText : {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      input : { 
        height: 40,
        borderColor: 'gray',
        marginBottom: 10,
        width: 200,
      },
      modalContent: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        centeredView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalView: {
            margin: 20,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 35,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: '80%', // Set a fixed width or use a percentage
            // Optionally, set a fixed height or minHeight
          },

    }
    });


export default RecurringGigModal;