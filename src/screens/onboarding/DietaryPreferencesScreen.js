import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { dietaryOptions, allergenOptions } from '../../data/mockData';

export default function DietaryPreferencesScreen({ navigation, route }) {
  const { goal } = route.params;
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  const handleContinue = () => {
    navigation.navigate('FinalSetup', {
      goal,
      dietaryPreferences: selectedDietaryPreferences,
      allergies: selectedAllergies,
    });
  };

  const toggleDietaryPreference = (preference) => {
    setSelectedDietaryPreferences(prev => {
      if (prev.includes(preference.id)) {
        return prev.filter(id => id !== preference.id);
      } else {
        return [...prev, preference.id];
      }
    });
  };

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergy.id)) {
        return prev.filter(id => id !== allergy.id);
      } else {
        return [...prev, allergy.id];
      }
    });
  };

  const renderOptionCard = (option, isSelected, onToggle, color = Colors.primary) => (
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
        colors={isSelected ? [color + '20', color + '10'] : [Colors.surface, Colors.surface]}
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIconContainer, isSelected && { backgroundColor: color + '20' }]}>
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary + '10', Colors.background]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Tell us about your dietary preferences</Text>
            <Text style={styles.subtitle}>
              This helps us recommend meals that fit your lifestyle and keep you safe.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="leaf" size={20} color={Colors.primary} /> Dietary Choices
              </Text>
              <Text style={styles.sectionSubtitle}>Select any that apply to you</Text>
              <View style={styles.optionsGrid}>
                {dietaryOptions.map(option => 
                  renderOptionCard(
                    option, 
                    selectedDietaryPreferences.includes(option.id), 
                    toggleDietaryPreference,
                    Colors.primary
                  )
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="warning" size={20} color={Colors.warning} /> Allergies & Restrictions
              </Text>
              <Text style={styles.sectionSubtitle}>Select foods you need to avoid</Text>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.textLight} style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
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
    backgroundColor: Colors.primaryLight,
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
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});