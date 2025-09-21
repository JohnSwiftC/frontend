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
import { goalOptions } from '../../data/mockData';

export default function WelcomeScreen({ navigation }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleContinue = () => {
    if (selectedGoal) {
      navigation.navigate('DietaryPreferences', { goal: selectedGoal });
    }
  };

  const renderGoalCard = (goal) => (
    <TouchableOpacity
      key={goal.id}
      style={[
        styles.goalCard,
        selectedGoal?.id === goal.id && styles.selectedGoalCard
      ]}
      onPress={() => setSelectedGoal(goal)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={selectedGoal?.id === goal.id ? [goal.color + '20', goal.color + '10'] : [Colors.surface, Colors.surface]}
        style={styles.goalCardGradient}
      >
        <View style={styles.goalIconContainer}>
          <Text style={styles.goalIcon}>{goal.icon}</Text>
        </View>
        <View style={styles.goalContent}>
          <Text style={[styles.goalTitle, selectedGoal?.id === goal.id && { color: goal.color }]}>
            {goal.title}
          </Text>
          <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
        {selectedGoal?.id === goal.id && (
          <View style={[styles.checkIcon, { backgroundColor: goal.color }]}>
            <Ionicons name="checkmark" size={20} color={Colors.textLight} />
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appTitle}>OptiMeal</Text>
            <Text style={styles.subtitle}>Your AI Nutritionist</Text>
            <Text style={styles.description}>
              Let's personalize your dining experience! First, tell us your primary goal.
            </Text>
          </View>

          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>What's your goal?</Text>
            {goalOptions.map(renderGoalCard)}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedGoal && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!selectedGoal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedGoal ? [Colors.primary, Colors.primaryDark] : [Colors.border, Colors.border]}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, !selectedGoal && styles.disabledButtonText]}>
                Continue
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={selectedGoal ? Colors.textLight : Colors.textSecondary} 
                style={styles.buttonIcon}
              />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 24,
  },
  goalsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedGoalCard: {
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  goalCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  goalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalIcon: {
    fontSize: 28,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  disabledButton: {
    opacity: 0.6,
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
  disabledButtonText: {
    color: Colors.textSecondary,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});