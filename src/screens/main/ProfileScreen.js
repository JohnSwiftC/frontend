import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { goalOptions, dietaryOptions, allergenOptions } from '../../data/mockData';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await storage.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalChange = (newGoal) => {
    Alert.alert(
      'Change Goal',
      `Are you sure you want to change your goal to "${newGoal.title}"? This will update your meal recommendations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: async () => {
            const updatedProfile = {
              ...userProfile,
              goal: newGoal.id,
              goalDetails: newGoal,
            };
            await storage.saveUserProfile(updatedProfile);
            setUserProfile(updatedProfile);
          }
        },
      ]
    );
  };

  const handleDietaryPreferenceToggle = async (preferenceId) => {
    const currentPreferences = userProfile.dietaryPreferences || [];
    let updatedPreferences;
    
    if (currentPreferences.includes(preferenceId)) {
      updatedPreferences = currentPreferences.filter(id => id !== preferenceId);
    } else {
      updatedPreferences = [...currentPreferences, preferenceId];
    }
    
    const updatedProfile = {
      ...userProfile,
      dietaryPreferences: updatedPreferences,
    };
    
    await storage.saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
  };

  const handleAllergyToggle = async (allergyId) => {
    const currentAllergies = userProfile.allergies || [];
    let updatedAllergies;
    
    if (currentAllergies.includes(allergyId)) {
      updatedAllergies = currentAllergies.filter(id => id !== allergyId);
    } else {
      updatedAllergies = [...currentAllergies, allergyId];
    }
    
    const updatedProfile = {
      ...userProfile,
      allergies: updatedAllergies,
    };
    
    await storage.saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will clear all your preferences and you\'ll need to go through onboarding again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            // In a real app, you'd navigate back to onboarding
            Alert.alert('Profile Reset', 'Please restart the app to go through onboarding again.');
          }
        },
      ]
    );
  };

  const renderGoalSection = () => {
    if (!userProfile) return null;

    const currentGoal = goalOptions.find(goal => goal.id === userProfile.goal) || goalOptions[1];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Goal</Text>
        <View style={styles.currentGoalCard}>
          <LinearGradient
            colors={[currentGoal.color + '20', currentGoal.color + '10']}
            style={styles.currentGoalGradient}
          >
            <View style={styles.goalHeader}>
              <View style={[styles.goalIcon, { backgroundColor: currentGoal.color + '30' }]}>
                <Text style={styles.goalIconText}>{currentGoal.icon}</Text>
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, { color: currentGoal.color }]}>
                  {currentGoal.title}
                </Text>
                <Text style={styles.goalDescription}>{currentGoal.description}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.subsectionTitle}>Change Goal:</Text>
        <View style={styles.goalOptions}>
          {goalOptions.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                goal.id === userProfile.goal && styles.selectedGoalOption
              ]}
              onPress={() => goal.id !== userProfile.goal && handleGoalChange(goal)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalOptionIcon}>{goal.icon}</Text>
              <Text style={[
                styles.goalOptionText,
                goal.id === userProfile.goal && { color: goal.color, fontWeight: 'bold' }
              ]}>
                {goal.title}
              </Text>
              {goal.id === userProfile.goal && (
                <Ionicons name="checkmark-circle" size={20} color={goal.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDietarySection = () => {
    if (!userProfile) return null;

    const currentPreferences = userProfile.dietaryPreferences || [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <View style={styles.optionsGrid}>
          {dietaryOptions.map(option => {
            const isSelected = currentPreferences.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedOptionCard
                ]}
                onPress={() => handleDietaryPreferenceToggle(option.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  isSelected && { color: Colors.primary, fontWeight: 'bold' }
                ]}>
                  {option.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkMark}>
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderAllergySection = () => {
    if (!userProfile) return null;

    const currentAllergies = userProfile.allergies || [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allergies & Restrictions</Text>
        <View style={styles.optionsGrid}>
          {allergenOptions.map(option => {
            const isSelected = currentAllergies.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedAllergyCard
                ]}
                onPress={() => handleAllergyToggle(option.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  isSelected && { color: Colors.warning, fontWeight: 'bold' }
                ]}>
                  {option.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkMark, { backgroundColor: Colors.warning }]}>
                    <Ionicons name="checkmark" size={16} color={Colors.textLight} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={24} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Meal Reminders</Text>
            <Text style={styles.settingDescription}>Get notified about meal times</Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={notificationsEnabled ? Colors.primary : Colors.textSecondary}
        />
      </View>

      <TouchableOpacity style={styles.settingButton} activeOpacity={0.7}>
        <Ionicons name="help-circle" size={24} color={Colors.info} />
        <Text style={styles.settingButtonText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingButton} activeOpacity={0.7}>
        <Ionicons name="information-circle" size={24} color={Colors.info} />
        <Text style={styles.settingButtonText}>About OptiMeal</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.settingButton, styles.dangerButton]} 
        onPress={handleResetProfile}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={24} color={Colors.error} />
        <Text style={[styles.settingButtonText, { color: Colors.error }]}>Reset Profile</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderGoalSection()}
        {renderDietarySection()}
        {renderAllergySection()}
        {renderSettingsSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  currentGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  currentGoalGradient: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalIconText: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  goalOptions: {
    gap: 8,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedGoalOption: {
    backgroundColor: Colors.primaryLight,
  },
  goalOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
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
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  selectedOptionCard: {
    backgroundColor: Colors.primaryLight,
    elevation: 3,
  },
  selectedAllergyCard: {
    backgroundColor: Colors.warning + '20',
    elevation: 3,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
});