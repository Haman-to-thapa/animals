import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, Platform, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import AdoptNavigator from './AdoptNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#88C0AE',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdoptTab') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeIconContainer : null}>
              <Ionicons name={iconName!} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen
        name="AdoptTab"
        component={AdoptNavigator}
        options={({ route }) => ({
          title: 'Adopt',
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'AdoptFeed';
            if (routeName === 'AdoptFeed') {
              return styles.tabBar;
            }
            return { display: 'none' };
          })(route),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProfileHome';
            if (routeName === 'HelpChat') {
              return { display: 'none' };
            }
            return styles.tabBar;
          })(route),
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: '#0A2E24',
    borderTopColor: '#1B5E20',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  }
});
