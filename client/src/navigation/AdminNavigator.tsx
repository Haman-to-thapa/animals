import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

export type AdminStackParamList = {
    AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F5F5F5' }
            }}
        >
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
