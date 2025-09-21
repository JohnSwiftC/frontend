import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';
import { generateMealPlan, generateAlternativeMeal } from '../../utils/MealPlanner';
import { diningCourts } from '../../data/mockData';

export default function TodaysPlanScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [plansByDate, setPlansByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [swappingMeal, setSwappingMeal] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const isAnimatingRef = React.useRef(false);
  const screenWidth = Dimensions.get('window').width;
  const [nextDatePlan, setNextDatePlan] = useState(null);
  const [animatingDirection, setAnimatingDirection] = useState(null);
  const slideX = React.useRef(new Animated.Value(0)).current;
  const nextSlideX = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserDataAndGeneratePlan(currentDate);
  }, []);

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

  // Do NOT auto-generate on date change; only generate when user taps
  // "Generate New Plan" or initial load for today
  useEffect(() => {
    if (!userProfile) return;
    const todayKey = formatDateKey(new Date());
    if (!plansByDate[todayKey]) {
      const plan = generateMealPlan(userProfile);
      setPlansByDate(prev => ({ ...prev, [todayKey]: plan }));
    }
  }, [userProfile]);

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

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return Colors.breakfast;
      case 'lunch': return Colors.lunch;
      case 'dinner': return Colors.dinner;
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

  const getDiningCourtInfo = (diningCourtId) => {
    return diningCourts.find(court => court.id === diningCourtId) || { name: 'Unknown Court', location: '' };
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  const animateToDate = (direction) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setAnimatingDirection(direction);
    
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (direction === 'next' ? 1 : -1)
    );
    
    // Check if target date has a plan, but don't auto-generate
    const targetKey = formatDateKey(targetDate);
    const targetPlan = plansByDate[targetKey] || null;
    setNextDatePlan(targetPlan);
    
    const sign = direction === 'next' ? -1 : 1;
    
    // Position the next view off-screen
    nextSlideX.setValue(-sign * screenWidth);
    
    // Animate both views simultaneously
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: sign * screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(nextSlideX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Update the date
      setCurrentDate(targetDate);
      
      // Reset animation values
      slideX.setValue(0);
      nextSlideX.setValue(0);
      setNextDatePlan(null);
      setAnimatingDirection(null);
      isAnimatingRef.current = false;
    });
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };
  
  const handlePrevDay = () => {
    if (isToday()) return; // Don't allow going to previous day if current date is today
    animateToDate('prev');
  };
  const handleNextDay = () => animateToDate('next');

  const dateKey = formatDateKey(currentDate);
  const currentPlan = plansByDate[dateKey] || null;

  const renderNutritionSummaryForPlan = (plan) => {
    if (!plan || !plan.totalNutrition || !plan.targets) return null;

    const { totalNutrition, targets } = plan;
    
    return (
      <View style={styles.nutritionContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.nutritionGradient}
        >
          <Text style={styles.nutritionTitle}>Daily Nutrition</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.calories)}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetCalories}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.protein)}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetProtein}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.carbs)}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetCarbs}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.fat)}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetFat}g</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderNutritionSummary = () => {
    return renderNutritionSummaryForPlan(currentPlan);
    
    return (
      <View style={styles.nutritionContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.nutritionGradient}
        >
          <Text style={styles.nutritionTitle}>Daily Nutrition</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.calories)}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetCalories}</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.protein)}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetProtein}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.carbs)}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetCarbs}g</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{Math.round(totalNutrition.fat)}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionTarget}>/ {targets.targetFat}g</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderMealCard = (mealType, meal) => {
    const color = getMealTypeColor(mealType);
    const icon = getMealTypeIcon(mealType);
    const isSwapping = swappingMeal === mealType;
    
    if (!meal) {
      return (
        <View key={mealType} style={styles.mealCard}>
          <View style={styles.mealCardContent}>
            <Text style={styles.mealTypeTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
            <Text style={styles.noMealText}>No suitable meal found</Text>
          </View>
        </View>
      );
    }

    const diningCourt = getDiningCourtInfo(meal.diningCourt);

    return (
      <View key={mealType} style={styles.mealCard}>
        <LinearGradient
          colors={[color + '15', Colors.surface]}
          style={styles.mealCardGradient}
        >
          <View style={styles.mealHeader}>
            <View style={styles.mealTypeContainer}>
              <View style={[styles.mealIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <View style={styles.mealHeaderText}>
                <Text style={styles.mealTypeTitle}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
                <Text style={styles.diningCourtName}>{diningCourt.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: color }]}
              onPress={() => handleSwapMeal(mealType)}
              disabled={isSwapping}
              activeOpacity={0.7}
            >
              {isSwapping ? (
                <ActivityIndicator size="small" color={Colors.textLight} />
              ) : (
                <Ionicons name="refresh" size={20} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.mealContent}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.diningCourtLocation}>{diningCourt.location}</Text>
            
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionBadgeText}>{meal.calories} cal</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionBadgeText}>{meal.protein}g protein</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionBadgeText}>{meal.carbs}g carbs</Text>
              </View>
              <View style={styles.nutritionBadge}>
                <Text style={styles.nutritionBadgeText}>{meal.fat}g fat</Text>
              </View>
            </View>

            {meal.dietary && meal.dietary.length > 0 && (
              <View style={styles.dietaryInfo}>
                {meal.dietary.map(diet => (
                  <View key={diet} style={[styles.dietaryBadge, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.dietaryText, { color: Colors.success }]}>{diet}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }; 

  if (isLoading && !isAnimatingRef.current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating your meal plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Meal Plan</Text>
        </View>

        <View style={styles.dayHeaderContainer}>
          <View style={styles.dayHeaderFixed}>
            <TouchableOpacity 
              style={[styles.dayNavButton, { opacity: isToday() ? 0.3 : 1 }]} 
              onPress={handlePrevDay} 
              activeOpacity={isToday() ? 1 : 0.7}
              disabled={isToday()}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dayNavButton} onPress={handleNextDay} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dayHeaderSlider}>
            {/* Current date header */}
            <Animated.View style={[styles.dayHeader, { transform: [{ translateX: slideX }] }]}>
              <View style={styles.dayNavButtonSpacer} />
              <Text style={styles.dayHeaderTitle} numberOfLines={1}>
                {getRelativeDayPrefix(currentDate)}, {formatShortDate(currentDate)}
              </Text>
              <View style={styles.dayNavButtonSpacer} />
            </Animated.View>
            
            {/* Next date header (for animation) */}
            {animatingDirection && (
              <Animated.View style={[styles.dayHeader, styles.nextDayHeader, { transform: [{ translateX: nextSlideX }] }]}>
                <View style={styles.dayNavButtonSpacer} />
                <Text style={styles.dayHeaderTitle} numberOfLines={1}>
                  {getRelativeDayPrefix(new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + (animatingDirection === 'next' ? 1 : -1)
                  ))}, {formatShortDate(new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + (animatingDirection === 'next' ? 1 : -1)
                  ))}
                </Text>
                <View style={styles.dayNavButtonSpacer} />
              </Animated.View>
            )}
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
        <View style={styles.contentContainer}>
          {/* Current content (animated) */}
          <Animated.View style={[styles.contentView, { transform: [{ translateX: slideX }] }]}>
            {currentPlan ? (
              <>
                {renderNutritionSummary()}

                <View style={styles.mealsContainer}>
                  {renderMealCard('breakfast', currentPlan.meals.breakfast)}
                  {renderMealCard('lunch', currentPlan.meals.lunch)}
                  {renderMealCard('dinner', currentPlan.meals.dinner)}
                </View>

                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleRefresh}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.secondary, Colors.secondaryDark]}
                    style={styles.regenerateGradient}
                  >
                    <Ionicons name="refresh-circle" size={24} color={Colors.textLight} />
                    <Text style={styles.regenerateText}>Generate New Plan</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <View style={styles.noDataContent}>
                  <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.noDataTitle}>No Plan Generated</Text>
                  <Text style={styles.noDataSubtitle}>Generate a meal plan for {getRelativeDayPrefix(currentDate)}</Text>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleRefresh}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={styles.generateGradient}
                    >
                      <Ionicons name="add-circle" size={24} color={Colors.textLight} />
                      <Text style={styles.generateText}>Generate New Plan</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
          
          {/* Next content (for animation) */}
          {animatingDirection && (
            <Animated.View style={[styles.contentView, styles.nextContentView, { transform: [{ translateX: nextSlideX }] }]}>
              {nextDatePlan ? (
                <>
                  {renderNutritionSummaryForPlan(nextDatePlan)}

                  <View style={styles.mealsContainer}>
                    {renderMealCard('breakfast', nextDatePlan.meals.breakfast)}
                    {renderMealCard('lunch', nextDatePlan.meals.lunch)}
                    {renderMealCard('dinner', nextDatePlan.meals.dinner)}
                  </View>

                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={handleRefresh}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[Colors.secondary, Colors.secondaryDark]}
                      style={styles.regenerateGradient}
                    >
                      <Ionicons name="refresh-circle" size={24} color={Colors.textLight} />
                      <Text style={styles.regenerateText}>Generate New Plan</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <View style={styles.noDataContent}>
                    <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.noDataTitle}>No Plan Generated</Text>
                    <Text style={styles.noDataSubtitle}>Generate a meal plan for this day</Text>
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={handleRefresh}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={styles.generateGradient}
                      >
                        <Ionicons name="add-circle" size={24} color={Colors.textLight} />
                        <Text style={styles.generateText}>Generate New Plan</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  dayNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderContainer: {
    position: 'relative',
    height: 60,
  },
  dayHeaderFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  dayHeaderSlider: {
    position: 'relative',
    height: 60,
    overflow: 'hidden',
  },
  dayHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayNavButtonSpacer: {
    width: 36,
    height: 36,
  },
  dayHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  nextDayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  contentContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  contentView: {
    width: '100%',
  },
  nextContentView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  nutritionContainer: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    opacity: 0.9,
  },
  nutritionTarget: {
    fontSize: 10,
    color: Colors.textLight,
    opacity: 0.7,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
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
    padding: 20,
  },
  mealCardContent: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealHeaderText: {
    flex: 1,
  },
  mealTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  diningCourtName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    marginTop: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  diningCourtLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  nutritionBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  nutritionBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  dietaryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  dietaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noMealText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  regenerateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  regenerateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  regenerateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  generateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginLeft: 8,
  },
});