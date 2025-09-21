import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { generateMealPlan, generateAlternativeMeal } from '../../utils/MealPlanner';
import { diningCourts } from '../../data/mockData';
import DayPlanView from '../../components/DayPlanView';

export default function TodaysPlanScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [plansByDate, setPlansByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [swappingMeal, setSwappingMeal] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const swiperRef = useRef(null);

  useEffect(() => {
    loadUserDataAndGeneratePlan(currentDate);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserDataAndGeneratePlan(currentDate);
    }, [currentDate])
  );

  const formatDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadUserDataAndGeneratePlan = async (dateObj) => {
    try {
      const profile = await storage.getUserProfile();
      if (profile) {
        setUserProfile(profile);
        
        // Generate meal plan with error handling
        let plan;
        try {
          plan = await generateMealPlan(profile);
        } catch (planError) {
          console.warn('Error generating meal plan, using defaults:', planError);
          // Create a basic plan structure if generation fails
          plan = {
            meals: {
              breakfast: { 
                id: 'default-b', 
                name: 'Breakfast', 
                calories: 350,
                protein: 20,
                carbs: 45,
                fat: 12
              },
              lunch: { 
                id: 'default-l', 
                name: 'Lunch', 
                calories: 450,
                protein: 30,
                carbs: 50,
                fat: 15
              },
              dinner: { 
                id: 'default-d', 
                name: 'Dinner', 
                calories: 500,
                protein: 35,
                carbs: 55,
                fat: 18
              }
            },
            totalNutrition: { calories: 1300, protein: 85, carbs: 150, fat: 45 },
            targets: {
              targetCalories: 2000,
              targetProtein: 100,
              targetCarbs: 250,
              targetFat: 65
            }
          };
        }
        
        // Ensure plan has required structure
        if (!plan.meals) {
          plan.meals = {
            breakfast: null,
            lunch: null,
            dinner: null
          };
        }
        
        // Calculate total nutrition if not present
        if (!plan.totalNutrition) {
          plan.totalNutrition = calculateTotalNutrition(plan.meals);
        }
        
        const key = formatDateKey(dateObj);
        setPlansByDate(prev => ({ ...prev, [key]: plan }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set empty plan to prevent crashes
      const key = formatDateKey(dateObj);
      setPlansByDate(prev => ({ 
        ...prev, 
        [key]: {
          meals: {
            breakfast: null,
            lunch: null,
            dinner: null
          },
          totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        }
      }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSwapMeal = async (mealType) => {
    setSwappingMeal(mealType);
    try {
      const key = formatDateKey(currentDate);
      const currentPlan = plansByDate[key];
      if (!currentPlan || !currentPlan.meals) return;
      
      const currentMeal = currentPlan.meals[mealType];
      const newMeal = await generateAlternativeMeal(currentMeal, userProfile, mealType);
  
      const updatedMealPlan = {
        ...currentPlan,
        meals: {
          ...currentPlan.meals,
          [mealType]: newMeal,
        },
      };
      
      updatedMealPlan.totalNutrition = calculateTotalNutrition(updatedMealPlan.meals);
      setPlansByDate(prev => ({ ...prev, [key]: updatedMealPlan }));
    } catch (error) {
      console.error('Error swapping meal:', error);
    } finally {
      setSwappingMeal(null);
    }
  };

  const calculateTotalNutrition = (meals) => {
    // Accept either an array of meal objects, or an object with arrays:
    // { breakfast: [...], lunch: [...], dinner: [...] }
    let items = [];

    if (!meals) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    // If meals is an array (old format), use it directly
    if (Array.isArray(meals)) {
      items = meals;
    } else if (typeof meals === 'object') {
      // Collect any arrays inside the meals object (breakfast/lunch/dinner)
      Object.keys(meals).forEach(key => {
        const v = meals[key];
        if (Array.isArray(v)) {
          items = items.concat(v);
        } else if (v && typeof v === 'object') {
          // In case a single meal object is stored at meals[key]
          items.push(v);
        }
      });
    }

    // Flatten items into individual food objects. Some items look like:
    // { hall: 'Earhart', foods: [ { calories, protein, ... }, ... ] }
    const flattenedFoods = [];
    items.forEach(it => {
      if (!it) return;
      if (Array.isArray(it)) {
        flattenedFoods.push(...it);
      } else if (it.foods && Array.isArray(it.foods)) {
        flattenedFoods.push(...it.foods);
      } else if (typeof it === 'object') {
        flattenedFoods.push(it);
      }
    });

    console.log("flattenedFoods", flattenedFoods);
    return flattenedFoods.reduce((total, meal) => {
      if (!meal) return total;
      return {
        calories: total.calories + meal.calories,
        protein: total.protein + meal.protein,
        carbs: total.carbs + meal.carbs,
        fat: total.fat + meal.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getDiningCourtInfo = (diningCourtId) => {
    return diningCourts.find(court => court.id === diningCourtId) || { name: 'Unknown Court', location: '' };
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRelativeDayPrefix = (date) => {
    const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = startOf(new Date());
    const target = startOf(date);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((target - today) / msPerDay);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const onIndexChanged = (index) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + index);
    setCurrentDate(newDate);
    const key = formatDateKey(newDate);
    if (!plansByDate[key]) {
      loadUserDataAndGeneratePlan(newDate);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating your meal plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.greeting}>Meal Plan</Text>
        </View>
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={false}
          showsButtons={true}
          buttonWrapperStyle={styles.swiperButtonsTop}
          nextButton={
            <View style={styles.dateNavButton}>
              <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
            </View>
          }
          prevButton={
            <View style={styles.dateNavButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </View>
          }
          onIndexChanged={onIndexChanged}
        >
          {dates.map((date, index) => {
            const dateKey = formatDateKey(date);
            const plan = plansByDate[dateKey];
            // console.log("plan", plan)
            return (
              <View key={index} style={styles.slide}>
                <DayPlanView
                  plan={plan}
                  onGenerate={() => loadUserDataAndGeneratePlan(date)}
                  isCurrentDay={index === 0}
                  getRelativeDayPrefix={getRelativeDayPrefix}
                  currentDate={date}
                  onSwapMeal={handleSwapMeal}
                  swappingMeal={swappingMeal}
                  getDiningCourtInfo={getDiningCourtInfo}
                />
              </View>
            );
          })}
        </Swiper>

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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'flex-start', // align content to left
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'left', // align text to left
  },

  slide: {
    flex: 1,
  },
  swiperButtonsTop: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  dateNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
