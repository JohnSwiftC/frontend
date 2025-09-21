import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { generateMealPlan } from '../../utils/MealPlanner';
import { goalOptions, dietaryOptions, allergenOptions } from '../../data/mockData';
import { useOnboarding } from '../../context/OnboardingContext';


export default function PlanReadyScreen({ onComplete }) {
  const { onboardingData } = useOnboarding();
  const { goal, dietaryPreferences, allergies, sex, age, height, weight, activityLevel, unitSystem } = onboardingData;
  const [mealPlan, setMealPlan] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideX] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    // Generate the meal plan
    const generatePlan = async () => {
      try {
        const userProfile = {
          goal: goal?.id || null,  // Add optional chaining
          goalDetails: goal || {},  // Provide default
          dietaryPreferences: dietaryPreferences || [],
          allergies: allergies || [],
          sex,
          age,
          height,
          weight,
          activityLevel,
          unitSystem,
          createdAt: new Date().toISOString(),
        };

        // Save profile and mark as onboarded
        await storage.saveUserProfile(userProfile);
        await storage.setOnboarded(true);

        // Generate meal plan
        const plan = await generateMealPlan(userProfile);
        setMealPlan(plan);

        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error('Error generating plan:', error);
        // Add fallback behavior
        if (onComplete) {
          onComplete();
        }
      }
    };

    generatePlan();
  }, []);

  const handleContinue = () => {
    Animated.timing(slideX, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  const renderMealCard = (meal, index) => {
    if (!meal) return null;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.mealCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateX: slideX }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.primaryLight + '20', Colors.primaryLight + '10']}
          style={styles.mealCardGradient}
        >
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <Text style={styles.mealCalories}>{meal.calories} cal</Text>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const footerContent = (
    <View 
      style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
    >
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.continueButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.continueButtonText}>Start Your Journey</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.textLight} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateX: slideX }]
        }]}>
          <View style={styles.headerContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
            </View>
            <Text style={styles.title}>Your Plan is Ready!</Text>
            <Text style={styles.subtitle}>
              Here's a preview of your personalized meal plan for today
            </Text>
          </View>

          {mealPlan && (
            <View style={styles.mealsContainer}>
              {renderMealCard(mealPlan.breakfast, 0)}
              {renderMealCard(mealPlan.lunch, 1)}
              {renderMealCard(mealPlan.dinner, 2)}
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mealPlan?.totalCalories || 0}</Text>
              <Text style={styles.statLabel}>Daily Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mealPlan?.mealsPerDay || 3}</Text>
              <Text style={styles.statLabel}>Meals Per Day</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {footerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  mealsContainer: {
    marginBottom: 24,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mealCardGradient: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  mealCalories: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginRight: 8,
  },
});