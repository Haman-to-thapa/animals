import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdoptFeedScreen from '../screens/adoption/AdoptFeedScreen';
import AdoptionDetailScreen from '../screens/adoption/AdoptionDetailScreen';
import AddAdoptionScreen from '../screens/adoption/AddAdoptionScreen';
import MyListingsScreen from '../screens/adoption/MyListingsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ChatListScreen from '../screens/adoption/ChatListScreen';
import ChatScreen from '../screens/adoption/ChatScreen';

export type AdoptStackParamList = {
    AdoptFeed: undefined;
    AdoptionDetail: { adoption: any };
    AddAdoption: undefined;
    MyListings: undefined;
    AdminAdoption: undefined;
    ChatList: undefined;
    Chat: { chatId: string; otherUserName: string };
};

const Stack = createNativeStackNavigator<AdoptStackParamList>();

const AdoptNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdoptFeed" component={AdoptFeedScreen} />
            <Stack.Screen name="AdoptionDetail" component={AdoptionDetailScreen} />
            <Stack.Screen name="AddAdoption" component={AddAdoptionScreen} />
            <Stack.Screen name="AdminAdoption" component={AdminDashboardScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
};

export default AdoptNavigator;
