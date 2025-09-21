import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';

const LOADING_MESSAGES = [
  "Crafting your perfect meal plan...",
  "Analyzing your preferences...", 
  "Finding the best dining options...",
  "Calculating nutritional balance...",
  "Personalizing your recommendations...",
  "Matching meals to your goals...",
  "Preparing your daily schedule...",
  "Optimizing for your dietary needs...",
  "Curating delicious options...",
  "Finalizing your meal journey..."
];

export default function LoadingScreen({ navigation, route }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [usedMessages, setUsedMessages] = useState([]);

  useEffect(() => {
    // Set initial message
    const getRandomMessage = () => {
      const availableMessages = LOADING_MESSAGES.filter(msg => !usedMessages.includes(msg));
      if (availableMessages.length === 0) {
        // If all messages used, reset but avoid the current one
        const resetMessages = LOADING_MESSAGES.filter(msg => msg !== currentMessage);
        setUsedMessages([]);
        return resetMessages[Math.floor(Math.random() * resetMessages.length)];
      }
      return availableMessages[Math.floor(Math.random() * availableMessages.length)];
    };

    const initialMessage = getRandomMessage();
    setCurrentMessage(initialMessage);
    setUsedMessages([initialMessage]);

    // Change message every 400ms for dynamic feel
    const messageInterval = setInterval(() => {
      const newMessage = getRandomMessage();
      setCurrentMessage(newMessage);
      setUsedMessages(prev => [...prev, newMessage]);
    }, 400);

    // Navigate to plan ready screen after 2 seconds
    const navigationTimer = setTimeout(() => {
      clearInterval(messageInterval);
      navigation.navigate('PlanReady', route.params);
    }, 2000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(navigationTimer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary + '15', Colors.background]}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.iconGradient}
            >
              <Ionicons name="restaurant" size={48} color={Colors.textLight} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>OptiMeal</Text>
          <Text style={styles.subtitle}>Your AI Nutritionist</Text>

          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="large" 
              color={Colors.primary} 
              style={styles.spinner}
            />
            <Text style={styles.loadingMessage}>{currentMessage}</Text>
          </View>

          <View style={styles.progressContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.progressBar}
            >
              <View style={styles.progressIndicator} />
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 64,
  },
  loadingContainer: {
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 24,
  },
  loadingMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
    minHeight: 24,
  },
  progressContainer: {
    width: '100%',
    marginTop: 48,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: Colors.textLight,
    opacity: 0.8,
  },
});
