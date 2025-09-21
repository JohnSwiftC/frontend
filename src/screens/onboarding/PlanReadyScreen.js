import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { generateMealPlan } from '../../utils/MealPlanner';
import { diningCourts } from '../../data/mockData';

export default function PlanReadyScreen({ navigation, route, onComplete }) {
  const { goal, dietaryPreferences, allergies } = route.params;
  const [mealPlan, setMealPlan] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Generate the meal plan
    const generatePlan = async () => {
      try {
        const userProfile = {
          goal: goal.id,
          goalDetails: goal,
          dietaryPreferences,
          allergies,
          createdAt: new Date().toISOString(),
        };

        // Save profile and mark as onboarded
        await storage.saveUserProfile(userProfile);
        await storage.setOnboarded(true);

        // Generate meal plan
        const plan = generateMealPlan(userProfile);
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
      }
    };

    generatePlan();
  }, []);

  const handleContinue = () => {
    onComplete();
  };

  const getDiningCourtInfo = (diningCourtId) => {
    return diningCourts.find(court => court.id === diningCourtId) || { name: 'Unknown Court', location: '' };
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return Colors.breakfast || Colors.primary;
      case 'lunch': return Colors.lunch || Colors.secondary;
      case 'dinner': return Colors.dinner || Colors.accent;
      default: return Colors.primary;
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      default: return 'restaurant';
    }
  };

  const renderMealCard = (mealType, meal) => {
    if (!meal) return null;

    const color = getMealTypeColor(mealType);
    const icon = getMealTypeIcon(mealType);
    const diningCourt = getDiningCourtInfo(meal.diningCourt);

    return (
      <View key={mealType} style={styles.mealCard}>
        <LinearGradient
          colors={[color + '15', Colors.surface]}
          style={styles.mealCardGradient}
        >
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealType}>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Text>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.diningCourt}>{diningCourt.name}</Text>
            </View>
            <View style={styles.nutritionSummary}>
              <Text style={styles.calories}>{meal.calories}</Text>
              <Text style={styles.caloriesLabel}>cal</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.success + '15', Colors.background]}
        style={styles.background}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.successContainer}>
              <View style={styles.checkmarkContainer}>
                <LinearGradient
                  colors={[Colors.success, Colors.success + 'CC']}
                  style={styles.checkmarkGradient}
                >
                  <Ionicons name="checkmark" size={48} color={Colors.textLight} />
                </LinearGradient>
              </View>

              <Text style={styles.successTitle}>Your meal plan is ready!</Text>
              <Text style={styles.successSubtitle}>
                We've crafted a personalized daily plan based on your preferences and goals.
              </Text>
            </View>

            {mealPlan && (
              <View style={styles.planPreview}>
                <Text style={styles.planTitle}>Today's Plan Preview</Text>
                
                <View style={styles.nutritionOverview}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.nutritionGradient}
                  >
                    <Text style={styles.nutritionTitle}>Daily Nutrition</Text>
                    <View style={styles.nutritionRow}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {Math.round(mealPlan.totalNutrition.calories)}
                        </Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {Math.round(mealPlan.totalNutrition.protein)}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {Math.round(mealPlan.totalNutrition.carbs)}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {Math.round(mealPlan.totalNutrition.fat)}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.mealsPreview}>
                  {renderMealCard('breakfast', mealPlan.meals.breakfast)}
                  {renderMealCard('lunch', mealPlan.meals.lunch)}
                  {renderMealCard('dinner', mealPlan.meals.dinner)}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.success, Colors.success + 'DD']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start My Journey</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.textLight} style={styles.buttonIcon} />
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  checkmarkGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  planPreview: {
    flex: 1,
    marginTop: 16,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  nutritionOverview: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  nutritionGradient: {
    padding: 20,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    opacity: 0.9,
  },
  mealsPreview: {
    gap: 12,
  },
  mealCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealCardGradient: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  diningCourt: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  nutritionSummary: {
    alignItems: 'center',
  },
  calories: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  caloriesLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
