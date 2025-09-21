
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';

export default function MealCard({ mealType, meal, onSwapMeal, swappingMeal, getDiningCourtInfo }) {
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
            onPress={() => onSwapMeal(mealType)}
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
}

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

const styles = StyleSheet.create({
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
});
