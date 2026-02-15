import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import MyAnimalsScreen from '../screens/adoption/MyAnimalsScreen';
import MySocialPostsScreen from '../screens/social/MySocialPostsScreen';
import MyListingsScreen from '../screens/adoption/MyListingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpChatScreen from '../screens/HelpChatScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileHome" component={ProfileScreen} />
            <Stack.Screen name="MyAnimals" component={MyAnimalsScreen} />
            <Stack.Screen name="MySocialPosts" component={MySocialPostsScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="HelpChat" component={HelpChatScreen} />
        </Stack.Navigator>
    );
}
