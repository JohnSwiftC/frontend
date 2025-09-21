import React, { useState } from 'react';
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

export default function PreferenceDetailScreen({ navigation, route }) {
  const { type, currentValue, onSave } = route.params;
  const [selectedValue, setSelectedValue] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'goal': return 'Goal';
      case 'activity': return 'Activity Level';
      case 'dietary': return 'Dietary Preferences';
      case 'allergies': return 'Allergies & Restrictions';
      default: return 'Preferences';
    }
  };

  const getOptions = () => {
    switch (type) {
      case 'goal': return goalOptions;
      case 'activity': return activityLevels;
      case 'dietary': return dietaryOptions;
      case 'allergies': return allergenOptions;
      default: return [];
    }
  };

  const isMultiSelect = () => {
    return type === 'dietary' || type === 'allergies';
  };

  const handleOptionPress = (optionId) => {
    if (isMultiSelect()) {
      const current = selectedValue || [];
      const updated = current.includes(optionId)
        ? current.filter(item => item !== optionId)
        : [...current, optionId];
      setSelectedValue(updated);
    } else {
      setSelectedValue(optionId);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Get current profile
      const profile = await storage.getUserProfile();
      
      let key;
      switch (type) {
        case 'goal':
          key = 'goal';
          break;
        case 'activity':
          key = 'activityLevel';
          break;
        case 'dietary':
          key = 'dietaryPreferences';
          break;
        case 'allergies':
          key = 'allergies';
          break;
        default:
          throw new Error(`Unknown preference type: ${type}`);
      }

      // Update the specific preference
      const updatedProfile = {
        ...profile,
        [key]: selectedValue
      };
      
      // Save updated profile
      await storage.saveUserProfile(updatedProfile);
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSave) onSave();
      navigation.goBack();
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setIsSaving(false);
    }
  };

  const renderSingleSelectOptions = () => {
    const options = getOptions();
    const isGoal = type === 'goal';

    return (
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.goalOption,
              selectedValue === option.id && styles.selectedGoalOption
            ]}
            onPress={() => handleOptionPress(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.goalOptionGradient, { backgroundColor: selectedValue === option.id ? (option.color + '20') : Colors.surface }] }>
              <View style={[styles.goalIcon, { backgroundColor: isGoal ? option.color : 'transparent' }]}>
                <Text style={{ fontSize: 18 }}>{option.icon}</Text>
              </View>
              <View style={styles.goalContent}>
                <Text style={[
                  styles.goalTitle,
                  selectedValue === option.id && { color: option.color }
                ]}>
                  {option.title}
                </Text>
                <Text style={styles.goalDescription}>{option.description}</Text>
              </View>
              {selectedValue === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={option.color} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  };

  const renderMultiSelectOptions = () => {
    const options = getOptions();
    const current = selectedValue || [];
    const color = type === 'allergies' ? Colors.warning : Colors.primary;
    
    return (
      <View style={styles.optionsGrid}>
        {options.map(option => {
          const isSelected = current.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
              onPress={() => handleOptionPress(option.id)}
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
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>{getTitle()}</Text>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Ionicons name="checkmark" size={22} color={Colors.text} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {isMultiSelect() ? renderMultiSelectOptions() : renderSingleSelectOptions()}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingButton: {
    backgroundColor: Colors.primaryDark,
  },
  saveButtonText: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  goalOption: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedGoalOption: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  goalOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  multiSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedMultiSelectOption: {
    backgroundColor: Colors.primaryLight,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  selectedOptionTitle: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
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
});
