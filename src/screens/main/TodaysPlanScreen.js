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
        const plan = generateMealPlan(profile);
        const key = formatDateKey(dateObj);
        setPlansByDate(prev => ({ ...prev, [key]: plan }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (!userProfile) {
      setIsRefreshing(false);
      return;
    }
    const key = formatDateKey(currentDate);
    const plan = generateMealPlan(userProfile);
    setPlansByDate(prev => ({ ...prev, [key]: plan }));
    setIsRefreshing(false);
  };

  const handleSwapMeal = async (mealType) => {
    setSwappingMeal(mealType);
    try {
      const key = formatDateKey(currentDate);
      const currentPlan = plansByDate[key];
      if (!currentPlan) return;
      const currentMeal = currentPlan.meals[mealType];
      const newMeal = generateAlternativeMeal(currentMeal, userProfile, mealType);

      const updatedMealPlan = {
        ...currentPlan,
        meals: {
          ...currentPlan.meals,
          [mealType]: newMeal,
        },
      };
      const totalNutrition = calculateTotalNutrition(Object.values(updatedMealPlan.meals));
      updatedMealPlan.totalNutrition = totalNutrition;
      setPlansByDate(prev => ({ ...prev, [key]: updatedMealPlan }));
    } catch (error) {
      console.error('Error swapping meal:', error);
    } finally {
      setSwappingMeal(null);
    }
  };

  const calculateTotalNutrition = (meals) => {
    return meals.reduce((total, meal) => {
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
          nextButton={<Ionicons name="chevron-forward" size={32} color="black" />}
          prevButton={<Ionicons name="chevron-back" size={32} color="black" />}
          onIndexChanged={onIndexChanged}
        >
          {dates.map((date, index) => {
            const dateKey = formatDateKey(date);
            const plan = plansByDate[dateKey];
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
    paddingBottom: 24,
    alignItems: 'center', // center content horizontally
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center', // ensure text is centered
  },

  slide: {
    flex: 1,
  },
  swiperButtonsTop: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
});
