import { mockMenuItems, mockUserProfiles, getMenuItemsFor } from '../data/mockData';

import { storage } from './AsyncStorage';

// AI Meal Planning Algorithm (Mock Implementation)
export  const generateMealPlan = async (userProfile = {}, excludedItems = []) => {
  const { goal, allergies = [], dietaryPreferences = [] } = userProfile;

  // Get target nutrition from profile goals
  const targets = mockUserProfiles[goal] || mockUserProfiles.maintain;

  // Safely fetch recommendations; default to empty object on error
  const recomendations = await storage.getRecommendations().catch((e) => {
    console.warn('storage.getRecommendations error', e);
    return {};
  }) || {};

  // Helper to resolve foods for a meal type. Backend may store per-day blocks keyed by 0 or '0'
  const resolveFoods = async (mealType, day = 0) => {
    // Try stored recommendation shape: recs[day][mealType].foods
    const dayBlock = recomendations?.[day] || recomendations?.[String(day)];
    const foodsFromRec = dayBlock && dayBlock[mealType] && dayBlock[mealType].foods;
    if (Array.isArray(foodsFromRec) && foodsFromRec.length > 0) return foodsFromRec;

    // Fallback to menu items provider (will use mock items if storage has none)
    try {
      const fallback = await getMenuItemsFor(undefined, day, mealType);
      if (Array.isArray(fallback) && fallback.length > 0) return fallback;
    } catch (e) {
      console.warn('getMenuItemsFor fallback error', e);
    }

    // Final fallback: local mock items filtered by category
    return mockMenuItems.filter(it => it.category === mealType);
  };

  // Resolve meals (arrays of item objects)
  const selectedMeals = {
    breakfast: recomendations["0"].breakfast,
    lunch: recomendations["0"].lunch,
    dinner: recomendations["0"].dinner,
  };

  // Calculate total nutrition
  const totalNutrition = calculateTotalNutrition(Object.values(selectedMeals));

  return {
    meals: selectedMeals,
    hall: recomendations?.hall,
    totalNutrition,
    targets,
    adherenceScore: calculateAdherenceScore(totalNutrition, targets),
  };
};

const getActivityMultiplier = (activityLevelId) => {
  switch (activityLevelId) {
    case 'sedentary':
      return 1.2;
    case 'lightly_active':
      return 1.375;
    case 'moderately_active':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'extra_active':
      return 1.9;
    default:
      return 1.2;
  }
};

const computeNutritionTargets = (profile) => {
  const {
    sex,
    age,
    height,
    weight,
    activityLevel,
    goal,
    unitSystem,
  } = profile;

  const safeAge = typeof age === 'number' ? age : 25;
  let safeHeightCm = typeof height === 'number' ? height : 175;
  let safeWeightKg = typeof weight === 'number' ? weight : 70;

  // Normalize to metric if profile stored as imperial
  if (unitSystem === 'imperial') {
    // height provided as centimeters already from PhysicalProfileScreen storage; if not, fallback assumes inches total
    if (safeHeightCm < 100) {
      // likely inches, convert to cm
      safeHeightCm = Math.round(safeHeightCm * 2.54);
    }
    if (safeWeightKg > 140) {
      // likely pounds, convert to kg
      safeWeightKg = Math.round(safeWeightKg / 2.20462);
    }
  }

  const isMale = String(sex || '').toLowerCase().startsWith('m');

  const bmr = isMale
    ? 10 * safeWeightKg + 6.25 * safeHeightCm - 5 * safeAge + 5
    : 10 * safeWeightKg + 6.25 * safeHeightCm - 5 * safeAge - 161;

  const multiplier = getActivityMultiplier(activityLevel);
  const tdee = bmr * multiplier;

  let targetCalories = tdee;
  switch (goal) {
    case 'loseWeight':
      targetCalories = tdee * 0.8;
      break;
    case 'gainMuscle':
      targetCalories = tdee * 1.15;
      break;
    case 'maintain':
    default:
      targetCalories = tdee * 1.0;
      break;
  }

  let proteinPct = 0.3;
  let carbsPct = 0.4;
  let fatPct = 0.3;

  if (goal === 'loseWeight') {
    proteinPct = 0.4;
    carbsPct = 0.3;
    fatPct = 0.3;
  } else if (goal === 'gainMuscle') {
    proteinPct = 0.3;
    carbsPct = 0.45;
    fatPct = 0.25;
  }

  const caloriesRounded = Math.round(targetCalories);
  const targetProtein = Math.round((caloriesRounded * proteinPct) / 4);
  const targetCarbs = Math.round((caloriesRounded * carbsPct) / 4);
  const targetFat = Math.round((caloriesRounded * fatPct) / 9);

  return {
    targetCalories: caloriesRounded,
    targetProtein,
    targetCarbs,
    targetFat,
  };
};

const selectMealItems = (items, targetCalories, targets) => {
  if (items.length === 0) return [];
  
  // Score items by proximity to target meal calories and protein density
  const scored = items.map(item => {
    const calorieScore = 1 - Math.abs(item.calories - targetCalories) / targetCalories;
    const proteinScore = item.protein / 50;
    const score = calorieScore * 0.6 + proteinScore * 0.4;
    return { ...item, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // Greedy pick up to 2 items without wildly exceeding targetCalories
  const picked = [];
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (let i = 0; i < scored.length && picked.length < 2; i++) {
    const candidate = scored[i];
    const projectedCalories = total.calories + candidate.calories;
    // Allow slight overshoot to find reasonable combos
    if (projectedCalories <= targetCalories * 1.15 || picked.length === 0) {
      picked.push(candidate);
      total.calories += candidate.calories;
      total.protein += candidate.protein;
      total.carbs += candidate.carbs;
      total.fat += candidate.fat;
    }
  }
  
  // Fallback to top-1 if nothing picked (shouldn't happen)
  if (picked.length === 0 && scored.length > 0) return [scored[0]];
  
  // Strip score before returning
  return picked.map(({ score, ...rest }) => rest);
};

const calculateTotalNutrition = (meals) => {
  // meals may be an array of arrays (each meal contains multiple food items)
  const items = Array.isArray(meals) ? meals.flat().filter(Boolean) : [];
  return items.reduce((total, meal) => {
    return {
      calories: total.calories + (meal.calories || 0),
      protein: total.protein + (meal.protein || 0),
      carbs: total.carbs + (meal.carbs || 0),
      fat: total.fat + (meal.fat || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

const calculateAdherenceScore = (actual, targets) => {
  const calorieAdherence = 1 - Math.abs(actual.calories - targets.targetCalories) / targets.targetCalories;
  const proteinAdherence = Math.min(actual.protein / targets.targetProtein, 1);
  const carbAdherence = 1 - Math.abs(actual.carbs - targets.targetCarbs) / targets.targetCarbs;
  const fatAdherence = 1 - Math.abs(actual.fat - targets.targetFat) / targets.targetFat;
  
  return Math.max(0, (calorieAdherence + proteinAdherence + carbAdherence + fatAdherence) / 4);
};

// Generate alternative meal for swapping
// Generate alternative meal for swapping
export const generateAlternativeMeal = async (currentMeal, userProfile, mealType) => {
  const excludedItems = currentMeal ? [currentMeal.id] : [];
  const fullPlan = await generateMealPlan(userProfile, excludedItems);
  return fullPlan?.meals?.[mealType] || null;
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
      !item.allergens.some(allergen => filters.allergies.includes(allergen))
    );
  }
  
  if (filters.dietary && filters.dietary.length > 0) {
    results = results.filter(item => 
      filters.dietary.some(diet => item.dietary.includes(diet))
    );
  }
  
  return results;
};