import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { goalOptions, dietaryOptions, allergenOptions } from '../../data/mockData';
import { useOnboarding } from '../../context/OnboardingContext';

const activityLevels = [
  { id: 'sedentary', title: 'Sedentary' },
  { id: 'lightly_active', title: 'Lightly Active' },
  { id: 'moderately_active', title: 'Moderately Active' },
  { id: 'very_active', title: 'Very Active' },
  { id: 'extra_active', title: 'Extra Active' },
];

export default function FinalSetupScreen() {
  const { onboardingData } = useOnboarding();
  const { goal, dietaryPreferences, allergies, sex, age, height, weight, activityLevel, unitSystem } = onboardingData;

  const getSelectedOptions = (optionsArray, selectedIds) => {
    if (!selectedIds) return [];
    return optionsArray.filter(option => option.id !== undefined && selectedIds.includes(option.id));
  };

  const selectedDietaryOptions = getSelectedOptions(dietaryOptions, dietaryPreferences);
  const selectedAllergyOptions = getSelectedOptions(allergenOptions, allergies);
  const selectedActivityLevel = activityLevels.find(level => level.id === activityLevel);

  const formatHeight = () => {
    if (unitSystem === 'imperial') {
      const totalInches = Math.round(height / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}' ${inches}"`;
    }
    return `${height} cm`;
  };

  const formatWeight = () => {
    if (unitSystem === 'imperial') {
      return `${Math.round(weight * 2.20462)} lbs`;
    }
    return `${weight} kg`;
  };

  const formatSex = (sex) => {
    if (!sex) return '';
    return sex.charAt(0).toUpperCase() + sex.slice(1);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Review your preferences before we create your meal plans.
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          {/* Physical Profile Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderSimple}>
              <Text style={styles.sectionTitle}>Your Profile</Text>
            </View>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Sex</Text>
                <Text style={styles.profileValue}>{formatSex(sex)}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileValue}>{age}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Height</Text>
                <Text style={styles.profileValue}>{formatHeight()}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Weight</Text>
                <Text style={styles.profileValue}>{formatWeight()}</Text>
              </View>
            </View>
          </View>
          
          {/* Goal Section */}
          {goal && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: goal.color + '15' }]}>
                  <Text style={styles.sectionEmoji}>{goal.icon}</Text>
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Your Goal</Text>
                  <Text style={[styles.sectionValue, { color: goal.color }]}>{goal.title}</Text>
                </View>
              </View>
              <Text style={styles.sectionDescription}>{goal.description}</Text>
            </View>
          )}

          {/* Activity Level Section */}
          {selectedActivityLevel && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderSimple}>
                <Text style={styles.sectionTitle}>Activity Level</Text>
              </View>
              <Text style={styles.sectionValue}>{selectedActivityLevel.title}</Text>
            </View>
          )}

          {/* Dietary Preferences Section */}
          {selectedDietaryOptions.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderSimple}>
                <Text style={styles.sectionTitle}>Dietary Preferences</Text>
              </View>
              <View style={styles.preferencesGrid}>
                {selectedDietaryOptions.map(option => (
                  <View key={option.id} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{option.icon} {option.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Allergies Section */}
          {selectedAllergyOptions.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderSimple}>
                <Text style={styles.sectionTitle}>Allergies & Restrictions</Text>
              </View>
              <View style={styles.preferencesGrid}>
                {selectedAllergyOptions.map(option => (
                  <View key={option.id} style={[styles.preferenceTag, styles.allergyTag]}>
                    <Text style={[styles.preferenceTagText, styles.allergyTagText]}>{option.icon} {option.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* No Restrictions Section */}
          {selectedDietaryOptions.length === 0 && selectedAllergyOptions.length === 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderSimple}>
                <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                <Text style={[styles.sectionValue, { color: Colors.success }]}>No restrictions</Text>
              </View>
              <Text style={styles.sectionDescription}>
                You'll have access to all available menu items!
              </Text>
            </View>
          )}
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flex: 1,
    gap: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileItem: {
    width: '48%',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderSimple: {
    marginBottom: 12,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  preferenceTagText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  allergyTag: {
    backgroundColor: Colors.warning + '20',
  },
  allergyTagText: {
    color: Colors.warning,
  },
});