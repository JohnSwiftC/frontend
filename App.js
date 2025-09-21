import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load Ionicons font
        await Font.loadAsync({
          ...Ionicons.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading error:', error);
        setFontError(error.message);
        // Continue anyway - icons might still work
        setFontsLoaded(true);
      }
    }
    
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: Colors.background || '#ffffff',
          padding: 20 
        }}>
          <ActivityIndicator size="large" color={Colors.primary || '#007AFF'} />
          <Text style={{ 
            marginTop: 16, 
            color: Colors.text || '#000000',
            textAlign: 'center' 
          }}>
            Loading fonts...
          </Text>
          {fontError && (
            <Text style={{ 
              marginTop: 8, 
              color: '#FF3B30',
              fontSize: 12,
              textAlign: 'center' 
            }}>
              Font error: {fontError}
            </Text>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
