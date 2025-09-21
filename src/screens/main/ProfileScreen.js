import React, { useState, useEffect } from 'react';
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

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { goalOptions, dietaryOptions, allergenOptions } from '../../data/mockData';

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
            <Text style={styles.subtitle}>Manage your meal preferences</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.preferencesContainer}>
          {renderPreferenceItem(
            'Goal',
            getGoalLabel(userProfile.goal),
            'goal',
            userProfile.goal
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
    paddingBottom: 24,
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
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
});