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
import { goalOptions } from '../../data/mockData';

export default function WelcomeScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(onboardingData.goal);

  useEffect(() => {
    updateOnboardingData({ goal: selectedGoal });
  }, [selectedGoal]);

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
        colors={selectedGoal?.id === goal.id ? [goal.color + '20', goal.color + '20'] : ['#F5F5F5', '#F5F5F5']}
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.goalsContainer}>
        <Text style={styles.title}>What's your goal?</Text>
        {goalOptions.map(renderGoalCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100, // Add padding to avoid being hidden by the footer
    paddingTop: 24,
  },
  goalsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
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
    backgroundColor: 'transparent',
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
});