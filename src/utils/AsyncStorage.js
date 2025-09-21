import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PROFILE: '@OptiMeal:userProfile',
  IS_ONBOARDED: '@OptiMeal:isOnboarded',
  MEAL_HISTORY: '@OptiMeal:mealHistory',
  FAVORITES: '@OptiMeal:favorites',
  ONBOARDING_DATA: '@OptiMeal:onboardingData', // new
  RECOMMENDATIONS: '@OptiMeal:recommendations', // new
};

export const storage = {
  // User Profile
  async saveUserProfile(profile) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  },

  async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Onboarding Status
  async setOnboarded(status = true) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, JSON.stringify(status));
      return true;
    } catch (error) {
      console.error('Error setting onboarded status:', error);
      return false;
    }
  },

  async getOnboardedStatus() {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
      return status ? JSON.parse(status) : false;
    } catch (error) {
      console.error('Error getting onboarded status:', error);
      return false;
    }
  },

  // Onboarding Data (existing)
  async saveOnboardingData(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  },

  async getOnboardingData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      return null;
    }
  },

  // Recommendations (new)
  async saveRecommendations(recommendations) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
      return true;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      return false;
    }
  },

  async getRecommendations() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
      console.log(JSON.parse(raw))
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {};
    }
  },

  async clearRecommendations() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
      return true;
    } catch (error) {
      console.error('Error clearing recommendations:', error);
      return false;
    }
  },

  // Meal History
  async saveMealHistory(history) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error saving meal history:', error);
      return false;
    }
  },

  async getMealHistory() {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting meal history:', error);
      return [];
    }
  },

  // Favorites
  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error saving favorites:', error);
      return false;
    }
  },

  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Clear all data
  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};