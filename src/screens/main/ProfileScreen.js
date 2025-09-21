import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { goalOptions, dietaryOptions, allergenOptions, activityLevels } from '../../data/mockData';
import { generateMealPlan } from '../../utils/MealPlanner';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Listen for preference updates from navigation
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

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

  const targets = useMemo(() => {
    if (!userProfile) return null;
    try {
      const plan = generateMealPlan(userProfile);
      return plan?.targets || null;
    } catch (e) {
      return null;
    }
  }, [userProfile]);

  const getPhysicalProfileLabel = (profile) => {
    if (!profile) return 'Not set';
    const { sex, age, height, weight, unitSystem } = profile;
    const sexLabel = sex ? sex.charAt(0).toUpperCase() + sex.slice(1) : 'N/A';
    const ageLabel = age ? `${age} yrs` : 'N/A';
    
    if (unitSystem === 'imperial') {
      const feet = Math.floor(height / 30.48);
      const inches = Math.round((height % 30.48) / 2.54);
      const heightLabel = `${feet}'${inches}"`;
      const weightLabel = `${Math.round(weight * 2.20462)} lbs`;
      return `${sexLabel}, ${ageLabel} · ${heightLabel} · ${weightLabel}`;
    }
    
    // Default to metric
    const heightLabel = height ? `${Math.round(height)} cm` : 'N/A';
    const weightLabel = weight ? `${Math.round(weight)} kg` : 'N/A';
    return `${sexLabel}, ${ageLabel} · ${heightLabel} · ${weightLabel}`;
  };

  const getActivityLevelLabel = (levelId) => {
    const level = activityLevels.find(l => l.id === levelId);
    return level ? level.title : 'Not set';
  };

  const getGoalLabel = (goalId) => {
    const goal = goalOptions.find(g => g.id === goalId);
    return goal ? goal.title : goalId;
  };

  const getDietaryLabel = (dietaryPrefs) => {
    if (!dietaryPrefs || dietaryPrefs.length === 0) return 'None';
    if (dietaryPrefs.length === 1) return dietaryPrefs[0];
    return `${dietaryPrefs[0]} +${dietaryPrefs.length - 1} more`;
  };

  const getAllergensLabel = (allergens) => {
    if (!allergens || allergens.length === 0) return 'None';
    if (allergens.length === 1) return allergens[0];
    return `${allergens[0]} +${allergens.length - 1} more`;
  };

  const handlePreferencePress = (type, currentValue) => {
    if (type === 'physical') {
      navigation.navigate('PhysicalProfileDetail', {
        currentValue,
        onSave: loadUserProfile,
      });
      return;
    }
    navigation.navigate('PreferenceDetail', {
      type,
      currentValue,
      onSave: loadUserProfile,
    });
  };

  const renderPreferenceItem = (title, value, type, currentValue) => (
    <TouchableOpacity
      style={styles.preferenceItem}
      onPress={() => handlePreferencePress(type, currentValue)}
      activeOpacity={0.7}
    >
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderTargetsBlock = () => {
    if (!targets) return null;
    return (
      <View style={styles.targetsContainer}>
        <Text style={styles.targetsTitle}>My Daily Nutrients</Text>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.targetsGradient}
        >
          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Calories</Text>
            <Text style={styles.targetValue}>{targets.targetCalories}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Protein</Text>
            <Text style={styles.targetValue}>{targets.targetProtein}g</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Carbs</Text>
            <Text style={styles.targetValue}>{targets.targetCarbs}g</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Fat</Text>
            <Text style={styles.targetValue}>{targets.targetFat}g</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (isLoading || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Preferences</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {renderTargetsBlock()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.preferencesContainer}>
          {renderPreferenceItem(
            'Physical Profile',
            getPhysicalProfileLabel(userProfile),
            'physical',
            userProfile
          )}
          {renderPreferenceItem(
            'Goal',
            getGoalLabel(userProfile.goal),
            'goal',
            userProfile.goal
          )}
          {renderPreferenceItem(
            'Activity Level',
            getActivityLevelLabel(userProfile.activityLevel),
            'activity',
            userProfile.activityLevel
          )}
          {renderPreferenceItem(
            'Dietary Preferences',
            getDietaryLabel(userProfile.dietaryPreferences),
            'dietary',
            userProfile.dietaryPreferences
          )}
          {renderPreferenceItem(
            'Allergies & Restrictions',
            getAllergensLabel(userProfile.allergies),
            'allergies',
            userProfile.allergies
          )}
        </View>
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  preferencesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  targetsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  targetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'left',
  },
  targetsGradient: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetItem: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 6,
  },
  targetLabel: {
    fontSize: 14,
    color: Colors.textLight,
    opacity: 0.9,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  targetValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textLight,
  },
});