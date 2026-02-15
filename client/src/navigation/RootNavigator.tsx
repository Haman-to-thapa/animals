import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/authScreen/LoginScreen';
import TabNavigator from './TabNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import { useAuth } from '../auth/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, profile, initializing } = useAuth();

  const isAdmin = profile?.role === 'admin' || 
    user?.uid === 'ILsdgrONLldiFbg4Ntecs5cBeFg2';

  if (initializing || (user && !profile)) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#EEF2F3' }
      }}
    >
      {user == null ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : isAdmin ? (
        <Stack.Screen name="AdminRoot" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}
