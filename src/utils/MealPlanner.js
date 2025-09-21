// src/utils/MealPlanner.js
import { mockMenuItems, mockUserProfiles, getMenuItemsFor } from '../data/mockData';
import { storage } from './AsyncStorage';

// AI Meal Planning Algorithm
export const generateMealPlan = async (userProfile = {}, excludedItems = []) => {
  const { goal, allergies = [], dietaryPreferences = [] } = userProfile;

  // Get target nutrition from profile goals
  const targets = mockUserProfiles[goal] || mockUserProfiles.maintain;

  // Safely fetch recommendations
  let recommendations;
  try {
    recommendations = await storage.getRecommendations();
    console.log('MealPlanner - Fetched recommendations:', recommendations);
  } catch (e) {
    console.warn('MealPlanner - Failed to get recommendations:', e);
    recommendations = null;
  }

  // Check for day 0 recommendations
  const dayZeroRecs = recommendations?.["0"] || recommendations?.[0];
  console.log('MealPlanner - Day 0 recommendations:', dayZeroRecs);
  
  let selectedMeals = {
    breakfast: null,
    lunch: null,
    dinner: null
  };

  if (dayZeroRecs && dayZeroRecs.breakfast && dayZeroRecs.lunch && dayZeroRecs.dinner) {
    console.log('MealPlanner - Using backend recommendations');
    
    // Keep the full backend response which includes the foods array
    // Just ensure each meal has the structure we need
    selectedMeals = {
      breakfast: dayZeroRecs.breakfast,
      lunch: dayZeroRecs.lunch,
      dinner: dayZeroRecs.dinner
    };
  } else {
    console.error('MealPlanner - No valid backend recommendations found');
    // Return a basic structure instead of throwing
    selectedMeals = {
      breakfast: { foods: [], name: 'No data', hall: 'Unknown' },
      lunch: { foods: [], name: 'No data', hall: 'Unknown' },
      dinner: { foods: [], name: 'No data', hall: 'Unknown' }
    };
  }

  // Calculate total nutrition from the foods arrays
  const totalNutrition = calculateTotalNutritionFromFoods(selectedMeals);

  return {
    meals: selectedMeals,
    hall: dayZeroRecs?.breakfast?.hall || dayZeroRecs?.breakfast?.name || 'Earhart',
    totalNutrition,
    targets,
    adherenceScore: calculateAdherenceScore(totalNutrition, targets)
  };
};

// Calculate nutrition from meals that contain foods arrays
const calculateTotalNutritionFromFoods = (meals) => {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  if (!meals) return totals;

  // Process each meal (breakfast, lunch, dinner)
  Object.values(meals).forEach(meal => {
    if (meal && meal.foods && Array.isArray(meal.foods)) {
      // Sum up nutrition from all foods in this meal
      meal.foods.forEach(food => {
        if (food) {
          totals.calories += food.calories || food.cal || 0;
          totals.protein += food.protein || food.pro || 0;
          totals.carbs += food.carbs || food.carb || 0;
          totals.fat += food.fat || 0;
        }
      });
    } else if (meal && typeof meal === 'object') {
      // Fallback if meal is a single food item
      totals.calories += meal.calories || meal.cal || 0;
      totals.protein += meal.protein || meal.pro || 0;
      totals.carbs += meal.carbs || meal.carb || 0;
      totals.fat += meal.fat || 0;
    }
  });

  // Round the totals
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein);
  totals.carbs = Math.round(totals.carbs);
  totals.fat = Math.round(totals.fat);

  return totals;
};

// Keep the old calculateTotalNutrition for backward compatibility
const calculateTotalNutrition = (meals) => {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  if (!meals) return totals;

  let mealItems = [];
  
  if (Array.isArray(meals)) {
    mealItems = meals;
  } else if (typeof meals === 'object') {
    mealItems = Object.values(meals).filter(meal => meal != null);
  }

  mealItems.forEach(meal => {
    if (meal && typeof meal === 'object') {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
    }
  });

  return totals;
};

const calculateAdherenceScore = (actual, targets) => {
  if (!actual || !targets) return 0;
  
  const calorieAdherence = targets.targetCalories ? 
    1 - Math.abs(actual.calories - targets.targetCalories) / targets.targetCalories : 0;
  const proteinAdherence = targets.targetProtein ? 
    Math.min(actual.protein / targets.targetProtein, 1) : 0;
  const carbAdherence = targets.targetCarbs ? 
    1 - Math.abs(actual.carbs - targets.targetCarbs) / targets.targetCarbs : 0;
  const fatAdherence = targets.targetFat ? 
    1 - Math.abs(actual.fat - targets.targetFat) / targets.targetFat : 0;
  
  return Math.max(0, (calorieAdherence + proteinAdherence + carbAdherence + fatAdherence) / 4);
};

// Generate alternative meal for swapping
export const generateAlternativeMeal = async (currentMeal, userProfile, mealType) => {
  // TODO: Implement actual alternative meal generation from backend
  // For now, return the current meal
  return currentMeal;
};

// Search meals functionality
export const searchMeals = (query, filters = {}) => {
  let results = mockMenuItems;
  
  // Text search
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.diningCourt.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply filters
  if (filters.category) {
    results = results.filter(item => item.category === filters.category);
  }
  
  if (filters.diningCourt) {
    results = results.filter(item => item.diningCourt === filters.diningCourt);
  }
  
  if (filters.allergies && filters.allergies.length > 0) {
    results = results.filter(item => 
      !item.allergens || !item.allergens.some(allergen => filters.allergies.includes(allergen))
    );
  }
  
  if (filters.dietary && filters.dietary.length > 0) {
    results = results.filter(item => 
      item.dietary && filters.dietary.some(diet => item.dietary.includes(diet))
    );
  }
  
  return results;
};