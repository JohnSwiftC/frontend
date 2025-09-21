// src/utils/MealPlanner.js
import { mockMenuItems, mockUserProfiles, getMenuItemsFor } from '../data/mockData';
import { storage } from './AsyncStorage';

// AI Meal Planning Algorithm (Mock Implementation)
export const generateMealPlan = async (userProfile = {}, excludedItems = []) => {
  const { goal, allergies = [], dietaryPreferences = [] } = userProfile;

  // Get target nutrition from profile goals
  const targets = mockUserProfiles[goal] || mockUserProfiles.maintain;

  // Safely fetch recommendations
  let recommendations;
  try {
    recommendations = await storage.getRecommendations() || {};
  } catch (e) {
    console.warn('Failed to get recommendations:', e);
    recommendations = {};
  }

  // Check if we have recommendations for day 0
  const dayZeroRecs = recommendations["0"] || recommendations[0];
  
  let selectedMeals = {
    breakfast: null,
    lunch: null,
    dinner: null
  };

  if (dayZeroRecs && dayZeroRecs.breakfast && dayZeroRecs.lunch && dayZeroRecs.dinner) {
    // Use backend recommendations
    console.log('Using backend recommendations');
    selectedMeals = {
      breakfast: dayZeroRecs.breakfast,
      lunch: dayZeroRecs.lunch,
      dinner: dayZeroRecs.dinner
    };
  } else {
    // Fallback to mock data
    console.log('Using mock data - no backend recommendations found');
    selectedMeals = {
      breakfast: createMockMeal('breakfast'),
      lunch: createMockMeal('lunch'),
      dinner: createMockMeal('dinner')
    };
  }

  // Calculate total nutrition
  const totalNutrition = calculateTotalNutrition(selectedMeals);

  return {
    meals: selectedMeals,
    hall: recommendations?.hall || dayZeroRecs?.breakfast?.hall || 'Earhart',
    totalNutrition,
    targets,
    adherenceScore: calculateAdherenceScore(totalNutrition, targets)
  };
};

const calculateTotalNutrition = (meals) => {
  // Initialize totals
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  if (!meals) {
    return totals;
  }

  // Handle both array and object formats
  let mealItems = [];
  
  if (Array.isArray(meals)) {
    mealItems = meals;
  } else if (typeof meals === 'object') {
    // Extract meal items from object (breakfast, lunch, dinner)
    mealItems = Object.values(meals).filter(meal => meal != null);
  }

  // Calculate totals
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
  // For now, return a simple mock alternative
  const alternatives = {
    breakfast: {
      id: 'alt-breakfast',
      name: 'Alternative Breakfast',
      description: 'Different morning option',
      calories: 320,
      protein: 18,
      carbs: 42,
      fat: 10,
      category: 'breakfast',
      diningCourt: 'windsor'
    },
    lunch: {
      id: 'alt-lunch',
      name: 'Alternative Lunch',
      description: 'Different midday option',
      calories: 420,
      protein: 28,
      carbs: 48,
      fat: 14,
      category: 'lunch',
      diningCourt: 'windsor'
    },
    dinner: {
      id: 'alt-dinner',
      name: 'Alternative Dinner',
      description: 'Different evening option',
      calories: 480,
      protein: 32,
      carbs: 52,
      fat: 16,
      category: 'dinner',
      diningCourt: 'windsor'
    }
  };
  
  return alternatives[mealType] || alternatives.breakfast;
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