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
      <>
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          <Text style={styles.mealTypeTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
        </View>
        </View>
        <View style={styles.mealContent}>
          <Text>No meals found</Text>

        </View>
      </>
    );
  }

  const diningCourt = getDiningCourtInfo(meal.diningCourt);

  return (
    <>
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          {/* <View style={[styles.mealIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View> */}
          <View style={styles.mealHeaderText}>
            <Text style={styles.mealTypeTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            <Text style={styles.spacer}> • </Text>
            <Text style={styles.diningCourtName}>{diningCourt.name}</Text>
          </View>
        </View>
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>
      
      <View style={styles.mealContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{left: -28.9, position: 'absolute', fontSize: 13, color: Colors.textSecondary}}>⬤</Text><Text style={styles.mealName}>{meal.name}</Text>
        </View>
        {/* <Text style={styles.diningCourtLocation}>{diningCourt.location}</Text> */}
        
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionBadgeText}>{meal.calories} cal</Text>
          <Text style={styles.spacer}> • </Text>
          <Text style={styles.nutritionBadgeText}>{meal.protein}g protein</Text>
          <Text style={styles.spacer}> • </Text>
          <Text style={styles.nutritionBadgeText}>{meal.carbs}g carbs</Text>
          <Text style={styles.spacer}> • </Text>
          <Text style={styles.nutritionBadgeText}>{meal.fat}g fat</Text>
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
    </>
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
  mealCardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  indentedCard: {
    marginLeft: 20,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  indentedCardPlaceholder: {
    marginLeft: 20,
    marginRight: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'center', 
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
  spacer: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    marginTop: 0,
    marginLeft: -10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 18,
  },
  diningCourtLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  nutritionRow: {
    marginTop: -8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  nutritionBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
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