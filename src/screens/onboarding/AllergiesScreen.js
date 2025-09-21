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
import { allergenOptions } from '../../data/mockData';

export default function AllergiesScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedAllergies, setSelectedAllergies] = useState(onboardingData.allergies);

  useEffect(() => {
    updateOnboardingData({ allergies: selectedAllergies });
  }, [selectedAllergies]);

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergy.id)) {
        return prev.filter(id => id !== allergy.id);
      } else {
        return [...prev, allergy.id];
      }
    });
  };

  const renderOptionCard = (option, isSelected, onToggle, color = Colors.warning) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        isSelected && styles.selectedOptionCard
      ]}
      onPress={() => onToggle(option)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={isSelected ? [color + '20', color + '20'] : ['#F5F5F5', '#F5F5F5']}
        style={styles.optionCardGradient}
      >
        <View style={styles.optionIconContainer}>
          <Text style={styles.optionIcon}>{option.icon}</Text>
        </View>
        <Text style={[styles.optionLabel, isSelected && { color: color, fontWeight: 'bold' }]}>
          {option.label}
        </Text>
        {isSelected && (
          <View style={[styles.checkIcon, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={16} color={Colors.textLight} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Allergies & Restrictions</Text>
        <Text style={styles.subtitle}>Select any that apply to you</Text>

        <View style={styles.section}>
          <View style={styles.optionsGrid}>
            {allergenOptions.map(option => 
              renderOptionCard(
                option, 
                selectedAllergies.includes(option.id), 
                toggleAllergy,
                Colors.warning
              )
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100, // Make sure content is not hidden by footer
  },
  content: {
    flex: 1,
    paddingTop: 40,
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionCard: {
    width: '48%',
    marginHorizontal: '1%',
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
  selectedOptionCard: {
    elevation: 4,
    shadowOpacity: 0.15,
  },
  optionCardGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 80,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
