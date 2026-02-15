import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../auth/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Navigation() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
