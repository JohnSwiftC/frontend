import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TodaysPlanScreen from '../screens/main/TodaysPlanScreen';
import BrowseMenusScreen from '../screens/main/BrowseMenusScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Colors } from '../constants/Colors';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'TodaysPlan') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BrowseMenus') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Fallback for missing icons
          if (!iconName) {
            iconName = 'ellipse';
          }

          try {
            return (
              <View style={{ 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: focused ? Colors.primaryLight : 'transparent',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginTop: 8,
              }}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          } catch (error) {
            console.warn('Icon rendering error:', error, 'iconName:', iconName);
            // Fallback to a simple circle
            return (
              <View style={{ 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: focused ? Colors.primaryLight : 'transparent',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginTop: 8,
              }}>
                <View style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
                }} />
              </View>
            );
          }
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="TodaysPlan" 
        component={TodaysPlanScreen}
        options={{
          tabBarLabel: "Today's Plan",
        }}
      />
      <Tab.Screen 
        name="BrowseMenus" 
        component={BrowseMenusScreen}
        options={{
          tabBarLabel: 'Browse Menus',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}