import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import MealCard from './MealCard';

export default function DayPlanView({ plan, onGenerate, isCurrentDay, getRelativeDayPrefix, currentDate, onSwapMeal, swappingMeal, getDiningCourtInfo }) {
  
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

  // render a meal row with a left timeline column (vertical line + circle) and the meal content to the right
  const renderMealRow = (mealType, meal) => {
    return (
      <View key={mealType} style={styles.mealRow}>
        <View style={styles.timelineColumn}>
          <View style={styles.timelineLine} />
          <View style={styles.timelineCircle}>
            <Ionicons name={iconNameForMeal(mealType)} size={16} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.mealContent}>
          <MealCard mealType={mealType} meal={meal} onSwapMeal={onSwapMeal} swappingMeal={swappingMeal} getDiningCourtInfo={getDiningCourtInfo} />
        </View>
      </View>
    );
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
        {renderMealRow('breakfast', plan.meals.breakfast)}
        {renderMealRow('lunch', plan.meals.lunch)}
        {renderMealRow('dinner', plan.meals.dinner)}
      </View>
      <TouchableOpacity
        style={styles.regenerateButton}
        onPress={onGenerate}
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
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
    marginBottom: 24,
  },

  // new meal row + timeline styles
  mealRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: 8,
  },
  timelineColumn: {
    width: 56,                 // space reserved for line + circle
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: Colors.border,
    transform: [{ translateX: -1 }],
  },
  timelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.primary,
    zIndex: 2,
    // center the circle horizontally on the timeline line
    position: 'relative',
    marginTop: 8,
  },
  mealContent: {
    flex: 1,
    paddingLeft: 6, // small gap between timeline column and meal content
  },

  // modern nutrition styles (boxes removed; numbers emphasized)
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // spread items evenly
    marginVertical: 12,
  },
  nutrientCard: {
    flex: 1,
    backgroundColor: 'transparent', // no box
    borderRadius: 0,                 // remove rounding
    paddingVertical: 6,              // tighter padding
    paddingHorizontal: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    // removed shadow/elevation to eliminate box appearance
  },
  nutrientCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutrientValue: {
    fontSize: 36,        // larger number
    fontWeight: '900',   // very bold
    color: Colors.text,
  },
  nutrientGoal: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  dateHeader: {
    fontSize: 22,           // increased for better prominence
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.cardBackground,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    
  },
});
