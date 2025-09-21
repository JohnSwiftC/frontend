import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';

import { Colors } from '../../constants/Colors';

const activityLevels = [
  { 
    id: 'sedentary', 
    title: 'Sedentary', 
    description: 'Little to no exercise',
    icon: '🛋️',
    color: Colors.textSecondary
  },
  { 
    id: 'lightly_active', 
    title: 'Lightly Active', 
    description: 'Light exercise 1-3 days/week',
    icon: '🚶',
    color: Colors.primary
  },
  { 
    id: 'moderately_active', 
    title: 'Moderately Active', 
    description: 'Moderate exercise 3-5 days/week',
    icon: '🏃',
    color: Colors.primary
  },
  { 
    id: 'very_active', 
    title: 'Very Active', 
    description: 'Heavy exercise 6-7 days/week',
    icon: '💪',
    color: Colors.primary
  },
  { 
    id: 'extra_active', 
    title: 'Extra Active', 
    description: 'Very heavy exercise, physical job',
    icon: '🔥',
    color: Colors.warning
  },
];

export default function ActivityLevelScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(onboardingData.activityLevel);

  useEffect(() => {
    updateOnboardingData({ activityLevel: selectedActivityLevel });
  }, [selectedActivityLevel]);

  const renderActivityCard = (activity) => (
    <TouchableOpacity
      key={activity.id}
      style={[
        styles.activityCard,
        selectedActivityLevel === activity.id && styles.selectedActivityCard
      ]}
      onPress={() => setSelectedActivityLevel(activity.id)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={selectedActivityLevel === activity.id ? [activity.color + '20', activity.color + '20'] : ['#F5F5F5', '#F5F5F5']}
        style={styles.activityCardGradient}
      >
        <View style={styles.activityIconContainer}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
        </View>
        {selectedActivityLevel === activity.id && (
          <View style={[styles.checkmarkContainer, { backgroundColor: activity.color }]}>
            <Ionicons name="checkmark" size={16} color={Colors.textLight} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Activity Level</Text>
        <Text style={styles.subtitle}>How active are you on a typical day?</Text>

        <View style={styles.activitiesContainer}>
          {activityLevels.map(renderActivityCard)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
  },
  activitiesContainer: {
    flex: 1,
  },
  activityCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: 'transparent',
  },
  selectedActivityCard: {
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  activityCardGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});