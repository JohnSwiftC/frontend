import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import DietaryPreferencesScreen from '../screens/onboarding/DietaryPreferencesScreen';
import FinalSetupScreen from '../screens/onboarding/FinalSetupScreen';
import LoadingScreen from '../screens/onboarding/LoadingScreen';
import PlanReadyScreen from '../screens/onboarding/PlanReadyScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator({ onComplete }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
      <Stack.Screen name="FinalSetup" component={FinalSetupScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="PlanReady">
        {props => <PlanReadyScreen {...props} onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}