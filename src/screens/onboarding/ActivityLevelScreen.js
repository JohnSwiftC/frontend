import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const activityLevels = [
  { id: 'sedentary', title: 'Sedentary', description: 'Little or no exercise' },
  { id: 'lightly_active', title: 'Lightly Active', description: 'Light exercise/sports 1-3 days/week' },
  { id: 'moderately_active', title: 'Moderately Active', description: 'Moderate exercise/sports 3-5 days/week' },
  { id: 'very_active', title: 'Very Active', description: 'Hard exercise/sports 6-7 days a week' },
  { id: 'extra_active', title: 'Extra Active', description: 'Very hard exercise/sports & physical job' },
];

export default function ActivityLevelScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState(onboardingData.activityLevel);

  useEffect(() => {
    updateOnboardingData({ activityLevel: selectedLevel });
  }, [selectedLevel]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Activity Level</Text>
        <Text style={styles.subtitle}>How active are you on a weekly basis?</Text>

        <View style={styles.optionsContainer}>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.optionCard, selectedLevel === level.id && styles.selectedOptionCard]}
              onPress={() => setSelectedLevel(level.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, selectedLevel === level.id && styles.selectedOptionText]}>{level.title}</Text>
                <Text style={[styles.optionDescription, selectedLevel === level.id && styles.selectedOptionText]}>{level.description}</Text>
              </View>
              {selectedLevel === level.id && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  selectedOptionText: {
    color: Colors.primary,
  },
  checkIcon: {
    marginLeft: 16,
  },
});
