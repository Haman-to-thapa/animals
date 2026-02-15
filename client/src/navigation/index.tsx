import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../auth/AuthContext';
import SplashScreen from '../screens/SplashScreen';

export default function Navigation() {
  const { user, initializing } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
