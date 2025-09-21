import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';

export default function MealCard({ mealType, meal, onSwapMeal, swappingMeal, getDiningCourtInfo }) {
  const color = getMealTypeColor(mealType);
  const icon = getMealTypeIcon(mealType);
  const isSwapping = swappingMeal === mealType;

  // console.log("meal", meal, mealType)

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
  // console.log("meal", meal);

  const mealItems = Array.isArray(meal) ? meal : [meal];
  const diningCourt = getDiningCourtInfo(mealItems[0]?.diningCourt);

  return (
    <>
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          {/* <View style={[styles.mealIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View> */}
          {/* <View style={styles.mealHeaderText}>
            <Text style={styles.mealTypeTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            <Text style={styles.spacer}> • </Text>
            <Text style={styles.diningCourtName}>{meal.hall}</Text>
          </View> */}
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
        {meal["foods"]?.map((item, index) => (
          <View key={item.id ?? index} style={styles.mealItem}>
            <View style={styles.mealItemHeader}>
              <Text style={styles.mealName}>{item.name}</Text>
            </View>

            <View style={styles.mealItemDetails}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionBadgeText}>{item.calories} cal</Text>
                <Text style={styles.spacer}> • </Text>
                <Text style={styles.nutritionBadgeText}>{item.protein}g protein</Text>
                <Text style={styles.spacer}> • </Text>
                <Text style={styles.nutritionBadgeText}>{item.carbs}g carbs</Text>
                <Text style={styles.spacer}> • </Text>
                <Text style={styles.nutritionBadgeText}>{item.fat}g fat</Text>
              </View>

              {item.dietary && item.dietary.length > 0 && (
                <View style={styles.dietaryInfo}>
                  {item.dietary.map(diet => (
                    <View key={diet} style={[styles.dietaryBadge, { backgroundColor: Colors.success + '20' }]}>
                      <Text style={[styles.dietaryText, { color: Colors.success }]}>{diet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
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
    marginBottom: 8,
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
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    marginTop: 0,
  },
  mealItem: {
    paddingLeft: 0,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary + '20',
    marginBottom: 8,
  },
  mealItemHeader: {
    marginBottom: 8,
    paddingLeft: 12,
  },
  mealItemDetails: {
    paddingLeft: 12, // aligned with meal name
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  diningCourtLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dietaryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dietaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  dietaryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noMealText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});