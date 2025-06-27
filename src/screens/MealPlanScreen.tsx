import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootState } from '../store/store';
import {
  createNewWeekPlan,
  addMealToPlan,
  removeMealFromPlan,
  setSelectedDate,
  Meal,
  WeeklyMealPlan,
} from '../store/slices/mealPlanSlice';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { key: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { key: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { key: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { key: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { key: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
];

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snacks', label: 'Snacks', icon: '🍿' },
];

const MealPlanScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    currentWeekPlan,
    availableMeals,
    selectedDate,
    isLoading,
  } = useSelector((state: RootState) => state.mealPlan);

  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.

  // Sample meals for demonstration
  const sampleMeals: Meal[] = [
    {
      id: '1',
      name: 'Avocado Toast',
      type: 'breakfast',
      description: 'Healthy avocado toast with eggs',
      imageUrl: 'https://example.com/avocado-toast.jpg',
      prepTime: 10,
      cookTime: 5,
      servings: 1,
      difficulty: 'Easy',
      ingredients: [
        { name: 'Avocado', amount: 1, unit: 'piece' },
        { name: 'Bread', amount: 2, unit: 'slices' },
        { name: 'Egg', amount: 1, unit: 'piece' },
      ],
             instructions: [
         'Toast the bread',
         'Mash avocado',
         'Fry egg and assemble',
       ],
      nutritionInfo: {
        calories: 320,
        protein: 15,
        carbs: 25,
        fat: 18,
        fiber: 8,
        sugar: 2,
      },
             tags: ['healthy', 'quick'],
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      type: 'lunch',
      description: 'Fresh salad with grilled chicken',
      imageUrl: 'https://example.com/chicken-salad.jpg',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      difficulty: 'Medium',
      ingredients: [
        { name: 'Chicken breast', amount: 200, unit: 'g' },
        { name: 'Mixed greens', amount: 100, unit: 'g' },
        { name: 'Cherry tomatoes', amount: 150, unit: 'g' },
      ],
             instructions: [
         'Season and grill chicken',
         'Prepare salad base',
         'Slice chicken and serve',
       ],
      nutritionInfo: {
        calories: 280,
        protein: 35,
        carbs: 8,
        fat: 12,
        fiber: 4,
        sugar: 6,
      },
             tags: ['protein', 'low-carb'],
    },
  ];

  const getWeekStartDate = (weekOffset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    return monday;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleCreateWeekPlan = () => {
    const startDate = getWeekStartDate(currentWeek);
    const planName = `Week of ${formatDate(startDate)}`;
    
    dispatch(createNewWeekPlan({
      name: planName,
      startDate: startDate.toISOString(),
    }));
    setShowCreatePlan(false);
  };

  const handleAddMeal = (meal: Meal) => {
    if (selectedDay && selectedMealType) {
      dispatch(addMealToPlan({
        day: selectedDay,
        mealType: selectedMealType,
        meal,
      }));
      setShowMealSelector(false);
    }
  };

  const handleRemoveMeal = (day: string, mealType: string, mealId?: string) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeMealFromPlan({ day, mealType, mealId })),
        },
      ]
    );
  };

  const openMealSelector = (day: string, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setShowMealSelector(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderMealCard = (meal: Meal | undefined, day: string, mealType: string) => {
    if (!meal) {
      return (
        <TouchableOpacity
          style={styles.emptyMealCard}
          onPress={() => openMealSelector(day, mealType)}
        >
          <Ionicons name="add" size={24} color={COLORS.textSecondary} />
          <Text style={styles.emptyMealText}>Add meal</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.mealCard} onPress={() => {}}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealName} numberOfLines={1}>
            {meal.name}
          </Text>
          <TouchableOpacity
            style={styles.removeMealButton}
            onPress={() => handleRemoveMeal(day, mealType, meal.id)}
          >
            <Ionicons name="close" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealCalories}>{meal.nutritionInfo.calories} cal</Text>
          <Text style={styles.mealTime}>{meal.prepTime + meal.cookTime} min</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayColumn = (day: typeof DAYS_OF_WEEK[0]) => {
    const dayMeals = currentWeekPlan?.meals[day.key] || {};
    const startDate = getWeekStartDate(currentWeek);
    const dayDate = new Date(startDate);
    const dayIndex = DAYS_OF_WEEK.findIndex(d => d.key === day.key);
    dayDate.setDate(startDate.getDate() + dayIndex);

    return (
      <View key={day.key} style={styles.dayColumn}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          <Text style={styles.dayDate}>{formatDate(dayDate)}</Text>
        </View>
        
        {MEAL_TYPES.map((mealType) => (
          <View key={mealType.key} style={styles.mealSlot}>
            <View style={styles.mealTypeHeader}>
              <Text style={styles.mealTypeIcon}>{mealType.icon}</Text>
              <Text style={styles.mealTypeLabel}>{mealType.label}</Text>
            </View>
            {mealType.key === 'snacks' ? (
              <View>
                {(dayMeals.snacks || []).map((snack, index) => (
                  <View key={index} style={styles.snackContainer}>
                    {renderMealCard(snack, day.key, mealType.key)}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addSnackButton}
                  onPress={() => openMealSelector(day.key, mealType.key)}
                >
                  <Ionicons name="add" size={16} color={COLORS.primary} />
                  <Text style={styles.addSnackText}>Add snack</Text>
                </TouchableOpacity>
              </View>
            ) : (
              renderMealCard((dayMeals as any)[mealType.key], day.key, mealType.key)
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <TouchableOpacity style={styles.mealListItem} onPress={() => handleAddMeal(item)}>
      <View style={styles.mealListInfo}>
        <Text style={styles.mealListName}>{item.name}</Text>
        <Text style={styles.mealListDescription}>{item.description}</Text>
        <View style={styles.mealListStats}>
          <Text style={styles.mealListStat}>{item.nutritionInfo.calories} cal</Text>
          <Text style={styles.mealListStat}>{item.prepTime + item.cookTime} min</Text>
          <Text style={styles.mealListStat}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Ionicons name="add-circle" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );

  if (!currentWeekPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Meal Plan</Text>
          <Text style={styles.emptySubtitle}>Create your first weekly meal plan</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreatePlan(true)}>
            <Text style={styles.createButtonText}>Create Meal Plan</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showCreatePlan} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreatePlan(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Meal Plan</Text>
              <TouchableOpacity onPress={handleCreateWeekPlan}>
                <Text style={styles.modalSave}>Create</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.createPlanText}>
                Create a meal plan for the week of {formatDate(getWeekStartDate(currentWeek))}
              </Text>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => setCurrentWeek(currentWeek - 1)}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Meal Plan</Text>
          <Text style={styles.weekTitle}>
            Week of {formatDate(getWeekStartDate(currentWeek))}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => setCurrentWeek(currentWeek + 1)}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekly Overview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekView}
        contentContainerStyle={styles.weekContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {DAYS_OF_WEEK.map(renderDayColumn)}
      </ScrollView>

      {/* Meal Selector Modal */}
      <Modal visible={showMealSelector} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMealSelector(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {selectedMealType} for {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.fullLabel}
            </Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          <FlatList
            data={sampleMeals.filter(meal => 
              selectedMealType === 'snacks' || meal.type === selectedMealType
            )}
            keyExtractor={(item) => item.id}
            renderItem={renderMealItem}
            style={styles.mealList}
            contentContainerStyle={styles.mealListContent}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  weekTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  weekNavButton: {
    padding: SPACING.sm,
  },
  weekView: {
    flex: 1,
  },
  weekContent: {
    paddingHorizontal: SPACING.md,
  },
  dayColumn: {
    width: 160,
    marginRight: SPACING.md,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  dayLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  dayDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  mealSlot: {
    marginBottom: SPACING.lg,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mealTypeIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  mealTypeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyMealCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  emptyMealText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  mealName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  removeMealButton: {
    marginLeft: SPACING.sm,
  },
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealCalories: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  snackContainer: {
    marginBottom: SPACING.sm,
  },
  addSnackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  addSnackText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  modalCancel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  modalSave: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPlanText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mealList: {
    flex: 1,
  },
  mealListContent: {
    padding: SPACING.lg,
  },
  mealListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealListInfo: {
    flex: 1,
  },
  mealListName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mealListDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  mealListStats: {
    flexDirection: 'row',
  },
  mealListStat: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
});

export default MealPlanScreen;
