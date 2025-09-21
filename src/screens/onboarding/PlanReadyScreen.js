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
          goal: goal.id,
          goalDetails: goal,
          dietaryPreferences,
          allergies,
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
      }
    };

    generatePlan();
  }, []);

  const handleContinue = () => {
    Animated.timing(slideX, {
      toValue: -screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };



  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideX }] }}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(footerHeight, 120) }]}>
            <View style={styles.successContainer}>
              <View style={styles.checkmarkContainer}>
                <LinearGradient
                  colors={[Colors.success, Colors.success + 'CC']}
                  style={styles.checkmarkGradient}
                >
                  <Ionicons name="checkmark" size={48} color={Colors.textLight} />
                </LinearGradient>
              </View>

              <Text style={styles.successTitle}>Your nutrition targets are set!</Text>
              <Text style={styles.successSubtitle}>
                Based on your profile, we've calculated your daily nutrition goals and created your first meal plan.
              </Text>
            </View>

            {mealPlan && (
              <View style={styles.nutritionTargetsSection}>
                <View style={styles.nutritionOverview}>
                  <LinearGradient
                    colors={[Colors.success, Colors.success + 'DD']}
                    style={styles.nutritionGradient}
                  >
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionGridRow}>
                        <View style={styles.nutritionGridItem}>
                          <Text style={styles.nutritionValue}>
                            {Math.round(mealPlan.targets.targetCalories)}
                          </Text>
                          <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionGridItem}>
                          <Text style={styles.nutritionValue}>
                            {Math.round(mealPlan.targets.targetProtein)}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>
                      </View>
                      <View style={styles.nutritionGridRow}>
                        <View style={styles.nutritionGridItem}>
                          <Text style={styles.nutritionValue}>
                            {Math.round(mealPlan.targets.targetCarbs)}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                        <View style={styles.nutritionGridItem}>
                          <Text style={styles.nutritionValue}>
                            {Math.round(mealPlan.targets.targetFat)}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Fat</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
                <Text style={styles.perDayText}>PER DAY</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]} onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.success, Colors.success + 'DD']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>View My Meals</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.textLight} style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120, // baseline, overridden by measured footerHeight
    paddingTop: 66, // Simulate header height so checkmark sits lower
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
    fontSize: 22,
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
    marginBottom: 2,
  },
  nutritionTargetsSection: {
    marginTop: 0,
    justifyContent: 'center',
  },
  nutritionOverview: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 16,
  },
  nutritionGradient: {
    padding: 16,
  },
  nutritionGrid: {
    gap: 8,
  },
  nutritionGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    marginHorizontal: 6,
    minHeight: 75,
    justifyContent: 'center',
  },
  nutritionValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textLight,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  perDayText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    padding: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
