import { storage } from '../utils/AsyncStorage';

import { Colors } from '../constants/Colors';

export const diningCourts = [
  {
    id: 'earhart',
    name: 'Earhart Dining Court',
    location: 'Near Earhart Residence Hall',
    hours: '7:00 AM - 10:00 PM',
  },
  {
    id: 'ford',
    name: 'Ford Dining Court', 
    location: 'Near Hillenbrand Hall',
    hours: '7:00 AM - 10:00 PM',
  },
  {
    id: 'wiley',
    name: 'Wiley Dining Court',
    location: 'Near Wiley Residence Hall', 
    hours: '7:00 AM - 10:00 PM',
  },
  {
    id: 'windsor',
    name: 'Windsor Dining Court',
    location: 'Near Windsor Halls',
    hours: '7:00 AM - 10:00 PM',
  }
];

export const activityLevels = [
  { 
    id: 'sedentary', 
    title: 'Sedentary', 
    description: 'Little to no exercise',
    icon: '🛋️',
    color: Colors.textSecondary
  },
  { 
    id: 'lightly_active', 
    title: 'Lightly Active', 
    description: 'Light exercise 1-3 days/week',
    icon: '🚶',
    color: Colors.primary
  },
  { 
    id: 'moderately_active', 
    title: 'Moderately Active', 
    description: 'Moderate exercise 3-5 days/week',
    icon: '🏃',
    color: Colors.primary
  },
  { 
    id: 'very_active', 
    title: 'Very Active', 
    description: 'Heavy exercise 6-7 days/week',
    icon: '💪',
    color: Colors.primary
  },
  { 
    id: 'extra_active', 
    title: 'Extra Active', 
    description: 'Very heavy exercise, physical job',
    icon: '🔥',
    color: Colors.warning
  },
];

export const mockMenuItems = [
];

export const mockUserProfiles = {
  loseWeight: {
    goal: 'Lose Weight',
    targetCalories: 1800,
    targetProtein: 135,
    targetCarbs: 180,
    targetFat: 60,
  },
  maintain: {
    goal: 'Maintain',
    targetCalories: 2200,
    targetProtein: 165,
    targetCarbs: 275,
    targetFat: 73,
  },
  gainMuscle: {
    goal: 'Gain Muscle',
    targetCalories: 2600,
    targetProtein: 195,
    targetCarbs: 325,
    targetFat: 87,
  },
};

export const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'pescatarian', label: 'Pescatarian', icon: '🐟' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🥩' },
];

export const allergenOptions = [
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'tree-nuts', label: 'Tree Nuts', icon: '🌰' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'fish', label: 'Fish', icon: '🐠' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
];

export const goalOptions = [
  {
    id: 'loseWeight',
    title: 'Lose Weight',
    subtitle: 'Create a caloric deficit',
    icon: '📉',
    color: '#FF5722',
    description: 'Focus on lower calorie, nutrient-dense meals'
  },
  {
    id: 'maintain',
    title: 'Maintain Weight', 
    subtitle: 'Balanced nutrition',
    icon: '⚖️',
    color: '#2196F3',
    description: 'Maintain current weight with balanced meals'
  },
  {
    id: 'gainMuscle',
    title: 'Gain Muscle',
    subtitle: 'High protein focus',
    icon: '💪',
    color: '#9C27B0', 
    description: 'Higher protein and calorie intake for muscle growth'
  },
];

// New helpers to access real recommendations stored by the startup logic.
// Components can call getRecommendation(day, hall, meal_type) or getAllRecommendations()
// to get the backend-provided data. If none available, fall back to mockMenuItems.

export async function getAllRecommendationsFromStorage() {
  try {
    const recs = await storage.getRecommendations();
    return recs || {};
  } catch (e) {
    console.warn('getAllRecommendationsFromStorage error', e);
    return {};
  }
}

// Returns the recommendation payload for a single day & meal_type, or null.
// day: integer days from today (0..), hall: string, meal_type: 'breakfast'|'lunch'|'dinner'
export async function getRecommendation(day = 0, hall = 'Windsor', meal_type = 'breakfast') {
  try {
    const recs = await getAllRecommendationsFromStorage();
    // stored structure used by fetchAndStoreAllRecommendations: { day: { mealType: data } }
    const dayBlock = recs?.[day];
    if (dayBlock && dayBlock[meal_type]) return dayBlock[meal_type];
    return null;
  } catch (e) {
    console.warn('getRecommendation error', e);
    return null;
  }
}

// Utility: get menu items for a hall/day/meal: prefer backend recs, otherwise filter mockMenuItems.
export async function getMenuItemsFor(hall = 'windsor', day = 0, meal_type = 'breakfast') {
  try {
    const rec = await getRecommendation(day, hall, meal_type);
    if (rec && Array.isArray(rec) && rec.length > 0) {
      // assume backend returns an array of item objects; return as-is
      return rec;
    }
    // fallback to local mock items filtered by diningCourt and category
    const normalizedHall = (hall || 'windsor').toLowerCase();
    return mockMenuItems.filter(
      (it) => it.category === meal_type && it.diningCourt === normalizedHall
    );
  } catch (e) {
    console.warn('getMenuItemsFor error', e);
    return mockMenuItems.filter((it) => it.category === meal_type);
  }
}