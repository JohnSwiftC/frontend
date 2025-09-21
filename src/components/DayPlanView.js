import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import MealCard from './MealCard';

export default function DayPlanView({ plan, onGenerate, isCurrentDay, getRelativeDayPrefix, currentDate, onSwapMeal, swappingMeal, getDiningCourtInfo }) {
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  });

  const toggleMealExpansion = (mealType) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };
  
  // helper: returns "Today", "Tomorrow" or a short formatted date like "Mon, Sep 22"
  const formatDisplayDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, tomorrow)) return 'Tomorrow';
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
  };

  // render a compact modern nutrition summary (no title)
  const renderNutritionSummary = () => {
    // prefer structured data under plan.nutrition but fall back to a few common keys
    const getMetric = (key, label) => {
      const source = plan?.totalNutrition || plan;
      // console.log("source", source);
      const source2 = plan?.targets || plan;
      const value = source?.[key]?.value ?? source?.[key] ?? null;
      const target = source2?.[key]?.target ?? source2?.['target'+label] ?? null;
      return { value, target };
    };

    const metrics = [
      { key: 'calories', label: 'Calories' },
      { key: 'protein', label: 'Protein' },
      { key: 'carbs', label: 'Carbs' },
      { key: 'fat', label: 'Fat' },
    ];

    return (
      <View style={styles.nutritionRow}>
        {metrics.map(m => {
          const { value, target } = getMetric(m.key, m.label);

          const displayValue = value !== null && value !== undefined ? value : '-';
          const displayTarget = target !== null && target !== undefined ? `/${target}` : '';
          return (
            <View key={m.key} style={styles.nutrientCard}>
              <Text style={styles.nutrientCategory}>{m.label}</Text>
              <Text style={styles.nutrientValue}>{displayValue}</Text>
              {displayTarget ? <Text style={styles.nutrientGoal}>{displayTarget}</Text> : null}
            </View>
          );
        })}
      </View>
    );
  };

  // helper: return icon name for each meal type
  const iconNameForMeal = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'fast-food-outline';
      case 'dinner': return 'moon-outline';
      default: return 'ellipse-outline';
    }
  };

  // render individual meal blocks with expand/collapse functionality
  const renderMealBlock = (mealType, meal) => {
    const items = Array.isArray(meal) ? meal : (meal ? [meal] : []);
    items.hall = plan.hall;
    const mealColor = getMealTypeColor(mealType);
    const mealIcon = iconNameForMeal(mealType);
    const isExpanded = expandedMeals[mealType];
    
    return (
      <View key={mealType} style={styles.mealBlock}>
        <TouchableOpacity 
          style={styles.mealBlockHeader}
          onPress={() => toggleMealExpansion(mealType)}
          activeOpacity={0.7}
        >
          <View style={styles.mealHeaderLeft}>
            <View style={[styles.mealIconContainer, { backgroundColor: mealColor + '15' }]}>
              <Ionicons name={mealIcon} size={20} color={mealColor} />
            </View>
            <Text style={styles.mealBlockTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            <Text style={styles.spacer}> • </Text>
            <Text style={styles.diningCourtName}>{meal.hall}</Text>
          </View>
          <View style={styles.expandButton}>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.mealBlockContent}>
            <MealCard mealType={mealType} meal={meal} onSwapMeal={onSwapMeal} swappingMeal={swappingMeal} getDiningCourtInfo={getDiningCourtInfo} />
          </View>
        )}
      </View>
    );
  };

  // helper function for meal colors
  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return Colors.breakfast;
      case 'lunch': return Colors.lunch;
      case 'dinner': return Colors.dinner;
      default: return Colors.primary;
    }
  };

  if (!plan) {
    return (
      <View style={styles.noDataContainer}>
        <View style={styles.noDataContent}>
          <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.noDataTitle}>No Plan Generated</Text>
          <Text style={styles.noDataSubtitle}>
            Generate a meal plan for {isCurrentDay ? getRelativeDayPrefix(currentDate) : 'this day'}
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={onGenerate}
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
    );
  }


  return (
    <>
    <Text style={styles.dateHeader}>{formatDisplayDate(currentDate)}</Text>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* modern nutrition summary (no "Daily Nutrition" title) */}
      {renderNutritionSummary()}
      <View style={styles.mealsContainer}>
        {renderMealBlock('breakfast', plan.meals.breakfast)}
        {renderMealBlock('lunch', plan.meals.lunch)}
        {renderMealBlock('dinner', plan.meals.dinner)}
      </View>
      <TouchableOpacity
        style={styles.regenerateButton}
        onPress={onGenerate}
        activeOpacity={0.8}
      >
        <View style={styles.regenerateButtonContent}>
          <Ionicons name="refresh-circle" size={24} color={Colors.textLight} />
          <Text style={styles.regenerateText}>Generate New Plan</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  diningCourtName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  spacer: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: 4,
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
  mealsContainer: {
    marginBottom: 4,
    marginHorizontal: 0, // no extra margin, same width as nutrition
  },

  // clean meal block styles
  mealBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 0, // no horizontal margin for full width
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    padding: 4,
    marginLeft: 12,
  },
  mealIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealBlockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  mealBlockContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // modern nutrition styles with proper sizing and width matching meals
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    marginHorizontal: 0, // same as meals for consistent width
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutrientCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  nutrientCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  nutrientValue: {
    fontSize: 28,        // reduced from 36
    fontWeight: '800',   // reduced from 900
    color: Colors.text,
  },
  nutrientGoal: {
    fontSize: 13,        // reduced from 12
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  regenerateButton: {
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginTop: 4,
    marginHorizontal: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regenerateButtonContent: {
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
  dateHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
