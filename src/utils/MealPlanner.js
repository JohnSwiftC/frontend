import { mockMenuItems, mockUserProfiles } from '../data/mockData';

// AI Meal Planning Algorithm (Mock Implementation)
export const generateMealPlan = (userProfile, excludedItems = []) => {
  const { goal, allergies = [], dietaryPreferences = [] } = userProfile;
  
  // Get target nutrition from profile goals
  const targets = mockUserProfiles[goal] || mockUserProfiles.maintain;
  
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
  
  // Simple algorithm: pick random items that fit within calorie goals
  const caloriesPerMeal = Math.floor(targets.targetCalories / 3);
  
  const selectedMeals = {
    breakfast: selectOptimalMeal(breakfastItems, caloriesPerMeal, targets),
    lunch: selectOptimalMeal(lunchItems, caloriesPerMeal, targets),
    dinner: selectOptimalMeal(dinnerItems, caloriesPerMeal, targets),
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

const selectOptimalMeal = (items, targetCalories, targets) => {
  if (items.length === 0) return null;
  
  // Sort by how close calories are to target and protein content
  const scored = items.map(item => {
    const calorieScore = 1 - Math.abs(item.calories - targetCalories) / targetCalories;
    const proteinScore = item.protein / 50; // Normalize protein score
    const score = calorieScore * 0.6 + proteinScore * 0.4;
    return { ...item, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // Add some randomness to avoid always picking the same items
  const topItems = scored.slice(0, Math.min(3, scored.length));
  const randomIndex = Math.floor(Math.random() * topItems.length);
  
  return topItems[randomIndex];
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

const calculateAdherenceScore = (actual, targets) => {
  const calorieAdherence = 1 - Math.abs(actual.calories - targets.targetCalories) / targets.targetCalories;
  const proteinAdherence = Math.min(actual.protein / targets.targetProtein, 1);
  const carbAdherence = 1 - Math.abs(actual.carbs - targets.targetCarbs) / targets.targetCarbs;
  const fatAdherence = 1 - Math.abs(actual.fat - targets.targetFat) / targets.targetFat;
  
  return Math.max(0, (calorieAdherence + proteinAdherence + carbAdherence + fatAdherence) / 4);
};

// Generate alternative meal for swapping
export const generateAlternativeMeal = (currentMeal, userProfile, mealType) => {
  const excludedItems = currentMeal ? [currentMeal.id] : [];
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