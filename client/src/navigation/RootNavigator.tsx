import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/authScreen/LoginScreen';
import TabNavigator from './TabNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuth } from '../auth/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, profile, initializing } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for at least 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin = profile?.role === 'admin' ||
    user?.uid === 'ILsdgrONLldiFbg4Ntecs5cBeFg2';

  // Show Splash if timer is running OR auth is still loading
  if (showSplash || initializing || (user && !profile)) {
    return <SplashScreen />;
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
