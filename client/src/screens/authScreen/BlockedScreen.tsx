import React from 'react';
import { View, Text } from 'react-native';

export default function BlockedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Your account is temporarily blocked.</Text>
      <Text>Please contact support.</Text>
    </View>
  );
}
