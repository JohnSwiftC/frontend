import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TodaysPlanScreen from '../screens/main/TodaysPlanScreen';
import BrowseMenusScreen from '../screens/main/BrowseMenusScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Colors } from '../constants/Colors';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const baseHeight = Platform.OS === 'ios' ? 49 : 56; // platform-standard
  const insetBottom = Math.max(insets.bottom, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'TodaysPlan') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BrowseMenus') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: baseHeight + insetBottom,
          paddingBottom: insetBottom,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen 
        name="TodaysPlan" 
        component={TodaysPlanScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen 
        name="BrowseMenus" 
        component={BrowseMenusScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: '',
        }}
      />
    </Tab.Navigator>
  );
}