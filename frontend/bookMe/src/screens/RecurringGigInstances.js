import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAppBar from "../components/CustomProviderBar";
import { Button } from "react-native-paper";
import ScreenLayout from "../components/ScreenLayout";
import { useUser } from "../UserContext";
import GigItem from "../components/GigItem";
import { adjustDateTimeToUTC4, adjustTimeToUTC4 } from "../../utils/utcTime";
import GigItemBis from "../components/GigItemBis";

const RecurringGigInstancesScreen = ({ route, navigation}) => {
    const { gigId } = route.params;
    const [gigInstances, setGigInstances] = useState([]);
    const [organizedGigs, setOrganizedGigs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { userInfo } = useUser();
    const [title, setTitle] = useState('');
    
    const getMonthsFromGigs = (gigs) => {
        const months = {};
        gigs.forEach(gig => {
            const date = new Date(gig.date);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            // Adjust the week calculation if necessary
            const weekStart = date.getDate() - date.getDay() + 1;
            const weekEnd = weekStart + 6; // assuming week starts on Sunday (0) and ends on Saturday (6)
            const weekKey = `Week of ${weekStart} to ${weekEnd}`;

            if (!months[month]) months[month] = {};
            if (!months[month][weekKey]) months[month][weekKey] = [];
            months[month][weekKey].push(gig);
        });
        return months;
    };

    useEffect(() => {
        const fetchGigInstances = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/gig/instances/${gigId}/`, {
                    headers: {
                        "Content-Type": "application/json",
                        // "X-CSRFToken": csrfToken, // Uncomment after defining csrfToken
                    },
                });
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setGigInstances(data.instances);
                console.log(data)
                setTitle(data.title);
            } catch (error) {
                console.error("Error fetching gig instances:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGigInstances();
    }, [gigId]);

    useEffect(() => {
        if (gigInstances.length > 0) {
            setOrganizedGigs(getMonthsFromGigs(gigInstances));
        }
    }, [gigInstances]);

    return (
        <>
            <CustomAppBar navigation={navigation} userInfo={userInfo} currentScreen="ProviderGigs" />
            <ScreenLayout>
                <View style={styles.screen}>
                    <FlatList
                        data={Object.entries(organizedGigs)}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item: [month, weeks] }) => (
                            <View key={month}>
                                <Text style={styles.monthHeader}>{month}</Text>
                                {Object.entries(weeks).map(([week, gigs], weekIndex) => (
                                    <View key={weekIndex}>
                                        <Text style={styles.weekHeader}>{week}</Text>
                                        <FlatList
                                            data={gigs}
                                            keyExtractor={(item, index) => item.id.toString()}
                                            renderItem={({ item }) => <GigItemBis gig={item} title={title} />}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}
                    />
                </View>
            </ScreenLayout>
        </>
    );
    
};
// Add styles as needed
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
    },
    upcomingGigsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    gigItem: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    gigTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    monthSection: {
        marginBottom: 10,
    },
    monthHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    monthHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
        marginBottom: 10,
    },
    weekHeader: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    editableText: {
        flex: 1,
        borderWidth: 1,
        borderColor: "gray",
        padding: 8,
        marginVertical: 4,
    },
    gigDetails: {
        fontSize: 15,
        color: "#666",
        marginTop: 5,
    },
    participantsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },
    subTitle : {
        fontSize: 14,
        marginBottom: 10,
    },
    bookingItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        width: 280,
    },
    // Additional styles...
});

export default RecurringGigInstancesScreen;
