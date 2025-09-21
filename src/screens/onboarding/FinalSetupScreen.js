import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { goalOptions, dietaryOptions, allergenOptions } from '../../data/mockData';

export default function FinalSetupScreen({ navigation, route }) {
  const { goal, dietaryPreferences, allergies } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleFinishSetup = () => {
    setIsLoading(true);
    
    // Navigate to loading screen with all the data
    navigation.navigate('Loading', {
      goal,
      dietaryPreferences,
      allergies,
    });
    
    setIsLoading(false);
  };

  const getSelectedOptions = (optionsArray, selectedIds) => {
    return optionsArray.filter(option => selectedIds.includes(option.id));
  };

  const selectedDietaryOptions = getSelectedOptions(dietaryOptions, dietaryPreferences);
  const selectedAllergyOptions = getSelectedOptions(allergenOptions, allergies);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary + '15', Colors.background]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.celebrationContainer}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.title}>You're all set!</Text>
              <Text style={styles.subtitle}>
                Let's review your preferences before we start creating your personalized meal plans.
              </Text>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={[goal.color + '20', goal.color + '10']}
                  style={styles.summaryCardGradient}
                >
                  <View style={styles.summaryHeader}>
                    <View style={[styles.summaryIcon, { backgroundColor: goal.color + '30' }]}>
                      <Text style={styles.summaryIconText}>{goal.icon}</Text>
                    </View>
                    <View style={styles.summaryHeaderText}>
                      <Text style={styles.summaryLabel}>Your Goal</Text>
                      <Text style={[styles.summaryValue, { color: goal.color }]}>{goal.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.summaryDescription}>{goal.description}</Text>
                </LinearGradient>
              </View>

              {selectedDietaryOptions.length > 0 && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryCardContent}>
                    <View style={styles.summaryHeader}>
                      <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + '30' }]}>
                        <Ionicons name="leaf" size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.summaryHeaderText}>
                        <Text style={styles.summaryLabel}>Dietary Preferences</Text>
                        <Text style={styles.summaryValue}>
                          {selectedDietaryOptions.map(option => option.label).join(', ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.optionsList}>
                      {selectedDietaryOptions.map(option => (
                        <View key={option.id} style={styles.optionItem}>
                          <Text style={styles.optionEmoji}>{option.icon}</Text>
                          <Text style={styles.optionText}>{option.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {selectedAllergyOptions.length > 0 && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryCardContent}>
                    <View style={styles.summaryHeader}>
                      <View style={[styles.summaryIcon, { backgroundColor: Colors.warning + '30' }]}>
                        <Ionicons name="warning" size={20} color={Colors.warning} />
                      </View>
                      <View style={styles.summaryHeaderText}>
                        <Text style={styles.summaryLabel}>Allergies & Restrictions</Text>
                        <Text style={styles.summaryValue}>
                          {selectedAllergyOptions.map(option => option.label).join(', ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.optionsList}>
                      {selectedAllergyOptions.map(option => (
                        <View key={option.id} style={styles.optionItem}>
                          <Text style={styles.optionEmoji}>{option.icon}</Text>
                          <Text style={styles.optionText}>{option.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {selectedDietaryOptions.length === 0 && selectedAllergyOptions.length === 0 && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryCardContent}>
                    <View style={styles.summaryHeader}>
                      <View style={[styles.summaryIcon, { backgroundColor: Colors.success + '30' }]}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                      </View>
                      <View style={styles.summaryHeaderText}>
                        <Text style={styles.summaryLabel}>Preferences</Text>
                        <Text style={styles.summaryValue}>No restrictions</Text>
                      </View>
                    </View>
                    <Text style={styles.summaryDescription}>
                      You'll have access to all available menu items!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, isLoading && styles.disabledButton]}
            onPress={handleFinishSetup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.textLight} />
              ) : (
                <> 
          
                  <Text style={styles.buttonText}>Start Planning My Meals</Text>
                  <Ionicons name="restaurant" size={20} color={Colors.textLight} style={styles.buttonIcon} />
                </>
              )}
            </LinearGradient>
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
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
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
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryCardGradient: {
    padding: 20,
  },
  summaryCardContent: {
    backgroundColor: Colors.surface,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryIconText: {
    fontSize: 24,
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  optionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  finishButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
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
});