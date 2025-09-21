import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { searchMeals } from '../../utils/MealPlanner';
import { diningCourts, dietaryOptions, allergenOptions } from '../../data/mockData';

export default function BrowseMenusScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('breakfast');
  const [selectedDiningCourt, setSelectedDiningCourt] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedCategory, selectedDiningCourt]);

  const performSearch = () => {
    const filters = {
      category: selectedCategory
    };
    
    if (selectedDiningCourt !== 'all') {
      filters.diningCourt = selectedDiningCourt;
    }
    
    const results = searchMeals(searchQuery, filters);
    setSearchResults(results);
  };

  const categories = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny' },
    { id: 'lunch', label: 'Lunch', icon: 'partly-sunny' },
    { id: 'dinner', label: 'Dinner', icon: 'moon' },
  ];

  const getDiningCourtInfo = (diningCourtId) => {
    return diningCourts.find(court => court.id === diningCourtId) || { name: 'Unknown Court', location: '' };
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.id ? Colors.textLight : Colors.textSecondary} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDiningCourtFilter = () => (
    <View style={styles.diningCourtFilter}>
      <Text style={styles.filterLabel}>Dining Court:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.diningCourtScroll}
        contentContainerStyle={styles.diningCourtContainer}
      >
        <TouchableOpacity
          style={[
            styles.diningCourtButton,
            selectedDiningCourt === 'all' && styles.selectedDiningCourtButton
          ]}
          onPress={() => setSelectedDiningCourt('all')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.diningCourtText,
            selectedDiningCourt === 'all' && styles.selectedDiningCourtText
          ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            All Courts
          </Text>
        </TouchableOpacity>
        {diningCourts.map(court => (
          <TouchableOpacity
            key={court.id}
            style={[
              styles.diningCourtButton,
              selectedDiningCourt === court.id && styles.selectedDiningCourtButton
            ]}
            onPress={() => setSelectedDiningCourt(court.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.diningCourtText,
              selectedDiningCourt === court.id && styles.selectedDiningCourtText
            ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {court.name.replace(' Dining Court', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMealItem = ({ item }) => {
    const diningCourt = getDiningCourtInfo(item.diningCourt);
    const categoryColor = item.category === 'breakfast' ? Colors.breakfast :
                         item.category === 'lunch' ? Colors.lunch : Colors.dinner;

    return (
      <TouchableOpacity style={styles.mealItem} activeOpacity={0.7}>
        <LinearGradient
          colors={[categoryColor + '10', Colors.surface]}
          style={styles.mealItemGradient}
        >
          <View style={styles.mealItemHeader}>
            <View style={styles.mealItemInfo}>
              <Text style={styles.mealItemName}>{item.name}</Text>
              <Text style={styles.mealItemCourt}>{diningCourt.name}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryBadgeText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.mealItemNutrition}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.calories}</Text>
              <Text style={styles.nutritionLabel}>cal</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.protein}g</Text>
              <Text style={styles.nutritionLabel}>protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.carbs}g</Text>
              <Text style={styles.nutritionLabel}>carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.fat}g</Text>
              <Text style={styles.nutritionLabel}>fat</Text>
            </View>
          </View>

          {(item.dietary.length > 0 || item.allergens.length > 0) && (
            <View style={styles.mealItemTags}>
              {item.dietary.map(diet => (
                <View key={diet} style={[styles.dietaryTag, { backgroundColor: Colors.success + '20' }]}>
                  <Text style={[styles.tagText, { color: Colors.success }]}>{diet}</Text>
                </View>
              ))}
              {item.allergens.map(allergen => (
                <View key={allergen} style={[styles.allergenTag, { backgroundColor: Colors.warning + '20' }]}>
                  <Ionicons name="warning" size={12} color={Colors.warning} />
                  <Text style={[styles.tagText, { color: Colors.warning, marginLeft: 4 }]}>{allergen}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Menus</Text>
        <Text style={styles.subtitle}>Explore today's dining options</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for meals..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderCategoryFilter()}
      {renderDiningCourtFilter()}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {searchResults.length} meal{searchResults.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showFilters ? "filter" : "filter-outline"} 
            size={20} 
            color={Colors.primary} 
          />
          <Text style={styles.filterToggleText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderMealItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mealsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No meals found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  categoryFilterContainer: {
    height: 64, // Fixed height to prevent vertical movement
    marginBottom: 5,
    overflow: 'hidden', // Prevent any overflow from affecting layout
  },
  categoryScroll: {
    paddingHorizontal: 20,
    height: 44,
  },
  categoryContainer: {
    alignItems: 'center',
    paddingRight: 20,
    height: 44, // Fixed height matching scroll view
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    height: 36, // Fixed height for buttons
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 80, // Minimum width to prevent squishing
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: Colors.textLight,
  },
  diningCourtFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 60, // Fixed height to prevent layout shift
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  diningCourtScroll: {
    height: 32,
  },
  diningCourtContainer: {
    paddingRight: 20,
    alignItems: 'center',
    height: 32, // Fixed height matching scroll view
  },
  diningCourtButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 28, // Fixed height
    justifyContent: 'center', // Center content vertically
    borderRadius: 16,
    marginRight: 8,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDiningCourtButton: {
    backgroundColor: Colors.secondary,
  },
  diningCourtText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedDiningCourtText: {
    color: Colors.textLight,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 40, // Fixed height to prevent shifts
  },
  resultsCount: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  mealsList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  mealItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealItemGradient: {
    padding: 16,
  },
  mealItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  mealItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  mealItemCourt: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
  },
  mealItemNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mealItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  allergenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});