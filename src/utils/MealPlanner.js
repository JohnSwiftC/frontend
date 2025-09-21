import { mockMenuItems } from '../data/mockData';

// AI Meal Planning Algorithm (Mock Implementation)
export const generateMealPlan = (userProfile, excludedItems = []) => {
  const { goal, allergies = [], dietaryPreferences = [] } = userProfile;

  const targets = computeNutritionTargets(userProfile);
  
  // Filter items based on user preferences and allergies
  const availableItems = mockMenuItems.filter(item => {
    // Check allergies
    const hasAllergen = item.allergens.some(allergen => allergies.includes(allergen));
    if (hasAllergen) return false;
    
    // Check dietary preferences
    if (dietaryPreferences.length > 0) {
      const matchesDiet = dietaryPreferences.some(diet => item.dietary.includes(diet));
      if (!matchesDiet && item.dietary.length > 0) return false;
    }
    
    // Check excluded items
    if (excludedItems.includes(item.id)) return false;
    
    return true;
  });
  console.log('Available Items:', availableItems);
  // Group by meal category
  const breakfastItems = availableItems.filter(item => item.category === 'breakfast');
  const lunchItems = availableItems.filter(item => item.category === 'lunch');
  const dinnerItems = availableItems.filter(item => item.category === 'dinner');
  
  // Simple algorithm: pick up to 2 items per meal that fit within calorie goals
  const caloriesPerMeal = Math.floor(targets.targetCalories / 3);
  
  const selectedMeals = {
    breakfast: selectMealItems(breakfastItems, caloriesPerMeal, targets),
    lunch: selectMealItems(lunchItems, caloriesPerMeal, targets),
    dinner: selectMealItems(dinnerItems, caloriesPerMeal, targets),
  };
  
  // Calculate total nutrition
  const totalNutrition = calculateTotalNutrition(Object.values(selectedMeals));
  
  return {
    meals: selectedMeals,
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
  return meals.reduce((total, meal) => {
    if (!meal) return total;
    // meal can be an array of items or a single item
    const items = Array.isArray(meal) ? meal : [meal];
    const sumForMeal = items.reduce((acc, item) => {
      if (!item) return acc;
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fat += item.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: total.calories + sumForMeal.calories,
      protein: total.protein + sumForMeal.protein,
      carbs: total.carbs + sumForMeal.carbs,
      fat: total.fat + sumForMeal.fat,
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
export const generateAlternativeMeal = (currentMeal, userProfile, mealType) => {
  const currentItems = Array.isArray(currentMeal) ? currentMeal : (currentMeal ? [currentMeal] : []);
  const excludedItems = currentItems.map(i => i.id);
  const fullPlan = generateMealPlan(userProfile, excludedItems);
  return fullPlan.meals[mealType];
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