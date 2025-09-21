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
  // Breakfast items
  {
    id: 'b1',
    name: 'Greek Yogurt Parfait',
    category: 'breakfast',
    diningCourt: 'earhart',
    calories: 180,
    protein: 15,
    carbs: 22,
    fat: 3,
    allergens: ['dairy'],
    dietary: ['vegetarian'],
  },
  {
    id: 'b2', 
    name: 'Steel Cut Oatmeal',
    category: 'breakfast',
    diningCourt: 'earhart',
    calories: 160,
    protein: 6,
    carbs: 30,
    fat: 3,
    allergens: [],
    dietary: ['vegan', 'vegetarian'],
  },
  {
    id: 'b3',
    name: 'Scrambled Eggs',
    category: 'breakfast',
    diningCourt: 'ford',
    calories: 140,
    protein: 12,
    carbs: 2,
    fat: 10,
    allergens: ['eggs'],
    dietary: ['vegetarian'],
  },
  {
    id: 'b4',
    name: 'Avocado Toast',
    category: 'breakfast',
    diningCourt: 'wiley',
    calories: 220,
    protein: 8,
    carbs: 25,
    fat: 12,
    allergens: ['gluten'],
    dietary: ['vegan', 'vegetarian'],
  },
  
  // Lunch items
  {
    id: 'l1',
    name: 'Grilled Chicken Breast',
    category: 'lunch',
    diningCourt: 'earhart',
    calories: 250,
    protein: 46,
    carbs: 0,
    fat: 6,
    allergens: [],
    dietary: [],
  },
  {
    id: 'l2',
    name: 'Quinoa Power Bowl',
    category: 'lunch', 
    diningCourt: 'ford',
    calories: 320,
    protein: 14,
    carbs: 58,
    fat: 8,
    allergens: [],
    dietary: ['vegan', 'vegetarian'],
  },
  {
    id: 'l3',
    name: 'Turkey & Swiss Sandwich',
    category: 'lunch',
    diningCourt: 'wiley',
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 15,
    allergens: ['gluten', 'dairy'],
    dietary: [],
  },
  {
    id: 'l4',
    name: 'Mediterranean Salad',
    category: 'lunch',
    diningCourt: 'windsor',
    calories: 290,
    protein: 12,
    carbs: 18,
    fat: 20,
    allergens: ['dairy'],
    dietary: ['vegetarian'],
  },
  
  // Dinner items
  {
    id: 'd1',
    name: 'Baked Salmon',
    category: 'dinner',
    diningCourt: 'earhart',
    calories: 340,
    protein: 39,
    carbs: 0,
    fat: 19,
    allergens: ['fish'],
    dietary: [],
  },
  {
    id: 'd2',
    name: 'Vegetable Stir Fry',
    category: 'dinner',
    diningCourt: 'ford',
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 7,
    allergens: [],
    dietary: ['vegan', 'vegetarian'],
  },
  {
    id: 'd3',
    name: 'Beef Tacos',
    category: 'dinner',
    diningCourt: 'wiley',
    calories: 420,
    protein: 32,
    carbs: 28,
    fat: 22,
    allergens: ['gluten', 'dairy'],
    dietary: [],
  },
  {
    id: 'd4',
    name: 'Lentil Curry',
    category: 'dinner',
    diningCourt: 'windsor',
    calories: 280,
    protein: 18,
    carbs: 45,
    fat: 6,
    allergens: [],
    dietary: ['vegan', 'vegetarian'],
  },
];

// Deprecated: static profiles were replaced by dynamic targets computed from physical profile
export const mockUserProfiles = {};

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