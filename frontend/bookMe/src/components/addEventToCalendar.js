import * as Calendar from 'expo-calendar';
import moment from 'moment'; // Optional, for date handling

export const addEventToCalendar = async (eventDetails) => {
    console.log('Adding event to calendar:', eventDetails);
    try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            console.warn("Calendar permissions not granted.");
            return null; // Return null or appropriate value indicating failure
        }

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(c => c.allowsModifications);

        if (!defaultCalendar) {
            console.warn("No calendars available for modifications.");
            return null; // Return null or appropriate value indicating failure
        }
        
        console.log('START DATE:', eventDetails.startDate.toISOString());
        
        const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
            title: eventDetails.title,
            startDate: eventDetails.startDate.toISOString(),
            endDate: eventDetails.endDate.toISOString(),
            notes: eventDetails.notes,
            location: eventDetails.location,
        });

        console.log(`Event created: ${eventId}`);
        return eventId; // Return the eventId
    } catch (error) {
        console.warn(`Error adding event to calendar: ${error}`);
        return null; // Return null or appropriate value indicating failure
    }
};



