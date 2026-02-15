import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdoptScreen() {
  return (
    <View style={styles.container}>
      <Text>Adopt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E65100',
  },
});
