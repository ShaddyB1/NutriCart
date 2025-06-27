import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootState } from '../store/store';
import {
  addNutritionEntry,
  addWaterIntake,
  updateNutritionGoals,
  setSelectedDate,
  NutritionEntry,
} from '../store/slices/nutritionSlice';

const { width } = Dimensions.get('window');

const NutritionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    entries,
    goals,
    dailySummaries,
    waterIntakes,
    selectedDate,
    streaks,
    isLoading,
  } = useSelector((state: RootState) => state.nutrition);

  const [showAddFood, setShowAddFood] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  const [newFood, setNewFood] = useState({
    foodName: '',
    serving: 1,
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const [waterAmount, setWaterAmount] = useState('250');

  // Get today's summary
  const todaysSummary = dailySummaries.find(s => s.date === selectedDate) || {
    date: selectedDate,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
    waterIntake: 0,
    mealsLogged: 0,
    netCalories: 0,
  };

  // Get today's entries
  const todaysEntries = entries.filter(entry => entry.date === selectedDate);
  const todaysWater = waterIntakes.filter(intake => intake.date === selectedDate);

  // Calculate progress percentages
  const calorieProgress = goals.calories > 0 ? (todaysSummary.totalCalories / goals.calories) * 100 : 0;
  const proteinProgress = goals.protein > 0 ? (todaysSummary.totalProtein / goals.protein) * 100 : 0;
  const carbProgress = goals.carbs > 0 ? (todaysSummary.totalCarbs / goals.carbs) * 100 : 0;
  const fatProgress = goals.fat > 0 ? (todaysSummary.totalFat / goals.fat) * 100 : 0;
  const waterProgress = goals.water > 0 ? (todaysSummary.waterIntake / goals.water) * 100 : 0;

  const handleAddFood = () => {
    if (!newFood.foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const nutritionEntry: Omit<NutritionEntry, 'id'> = {
      date: selectedDate,
      mealType: selectedMealType,
      foodName: newFood.foodName,
      serving: newFood.serving,
      unit: newFood.unit,
      nutritionInfo: {
        calories: newFood.calories,
        protein: newFood.protein,
        carbs: newFood.carbs,
        fat: newFood.fat,
        fiber: newFood.fiber,
        sugar: newFood.sugar,
        sodium: newFood.sodium,
        cholesterol: 0,
      },
    };

    dispatch(addNutritionEntry(nutritionEntry));
    
    // Reset form
    setNewFood({
      foodName: '',
      serving: 1,
      unit: 'serving',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
    setShowAddFood(false);
  };

  const handleAddWater = () => {
    const amount = parseInt(waterAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid water amount');
      return;
    }

    dispatch(addWaterIntake({
      date: selectedDate,
      amount,
      time: new Date().toISOString(),
    }));
    setShowWaterModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderProgressCircle = (
    value: number,
    max: number,
    label: string,
    unit: string,
    color: string,
    size: number = 80
  ) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <View style={[styles.progressCircle, { width: size, height: size }]}>
        <View style={styles.progressCircleContainer}>
          <View style={[styles.progressCircleBackground, { width: size, height: size, borderRadius: size / 2 }]} />
          <View
            style={[
              styles.progressCircleForeground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: color,
                borderWidth: strokeWidth,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        </View>
        <View style={styles.progressCircleContent}>
          <Text style={[styles.progressValue, { color }]}>
            {Math.round(value)}
          </Text>
          <Text style={styles.progressUnit}>{unit}</Text>
        </View>
        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    );
  };

  const renderMacroBar = (label: string, value: number, max: number, color: string) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    
    return (
      <View style={styles.macroBar}>
        <View style={styles.macroBarHeader}>
          <Text style={styles.macroBarLabel}>{label}</Text>
          <Text style={styles.macroBarValue}>
            {Math.round(value)}g / {max}g
          </Text>
        </View>
        <View style={styles.macroBarTrack}>
          <View
            style={[
              styles.macroBarProgress,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={styles.macroBarPercentage}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const renderMealSection = (mealType: string, icon: string) => {
    const mealEntries = todaysEntries.filter(entry => entry.mealType === mealType);
    const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.nutritionInfo.calories, 0);

    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealIcon}>{icon}</Text>
            <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          </View>
          <View style={styles.mealCalories}>
            <Text style={styles.mealCaloriesText}>{mealCalories} cal</Text>
          </View>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => {
              setSelectedMealType(mealType as any);
              setShowAddFood(true);
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {mealEntries.length > 0 ? (
          <View style={styles.mealEntries}>
            {mealEntries.map((entry) => (
              <View key={entry.id} style={styles.foodEntry}>
                <View style={styles.foodEntryInfo}>
                  <Text style={styles.foodEntryName}>{entry.foodName}</Text>
                  <Text style={styles.foodEntryServing}>
                    {entry.serving} {entry.unit}
                  </Text>
                </View>
                <Text style={styles.foodEntryCalories}>
                  {entry.nutritionInfo.calories} cal
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noMealsText}>No foods logged</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const yesterday = new Date(selectedDate);
            yesterday.setDate(yesterday.getDate() - 1);
            dispatch(setSelectedDate(yesterday.toISOString().split('T')[0]));
          }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => {
            const tomorrow = new Date(selectedDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dispatch(setSelectedDate(tomorrow.toISOString().split('T')[0]));
          }}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Calorie Summary */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.calorieTitle}>Daily Calories</Text>
            <TouchableOpacity onPress={() => setShowGoalsModal(true)}>
              <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calorieContent}>
            {renderProgressCircle(
              todaysSummary.totalCalories,
              goals.calories,
              'Calories',
              'cal',
              COLORS.primary,
              120
            )}
            
            <View style={styles.calorieStats}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatValue}>{goals.calories}</Text>
                <Text style={styles.calorieStatLabel}>Goal</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatValue}>{Math.round(todaysSummary.totalCalories)}</Text>
                <Text style={styles.calorieStatLabel}>Consumed</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={[
                  styles.calorieStatValue,
                  { color: goals.calories - todaysSummary.totalCalories >= 0 ? COLORS.success : COLORS.error }
                ]}>
                  {Math.round(goals.calories - todaysSummary.totalCalories)}
                </Text>
                <Text style={styles.calorieStatLabel}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Macronutrients</Text>
          {renderMacroBar('Protein', todaysSummary.totalProtein, goals.protein, COLORS.error)}
          {renderMacroBar('Carbs', todaysSummary.totalCarbs, goals.carbs, COLORS.warning)}
          {renderMacroBar('Fat', todaysSummary.totalFat, goals.fat, COLORS.success)}
        </View>

        {/* Water Intake */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Text style={styles.waterTitle}>Water Intake</Text>
            <TouchableOpacity
              style={styles.addWaterButton}
              onPress={() => setShowWaterModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
              <Text style={styles.addWaterText}>Add Water</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.waterProgress}>
            <View style={styles.waterProgressBar}>
              <View
                style={[
                  styles.waterProgressFill,
                  {
                    width: `${Math.min(waterProgress, 100)}%`,
                    backgroundColor: COLORS.info,
                  },
                ]}
              />
            </View>
            <Text style={styles.waterProgressText}>
              {todaysSummary.waterIntake}ml / {goals.water}ml
            </Text>
          </View>
          
          {todaysWater.length > 0 && (
            <View style={styles.waterEntries}>
              {todaysWater.map((water) => (
                <View key={water.id} style={styles.waterEntry}>
                  <Text style={styles.waterEntryAmount}>{water.amount}ml</Text>
                  <Text style={styles.waterEntryTime}>
                    {new Date(water.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Meals */}
        <View style={styles.mealsCard}>
          <Text style={styles.mealsTitle}>Meals</Text>
          {renderMealSection('breakfast', '🌅')}
          {renderMealSection('lunch', '☀️')}
          {renderMealSection('dinner', '🌙')}
          {renderMealSection('snack', '🍿')}
        </View>

        {/* Streaks */}
        <View style={styles.streaksCard}>
          <Text style={styles.streaksTitle}>Streaks</Text>
          <View style={styles.streaksContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streaks.logging}</Text>
              <Text style={styles.streakLabel}>Logging</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streaks.calorieGoal}</Text>
              <Text style={styles.streakLabel}>Calorie Goal</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streaks.waterGoal}</Text>
              <Text style={styles.streakLabel}>Water Goal</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={showAddFood} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddFood(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Food</Text>
            <TouchableOpacity onPress={handleAddFood}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newFood.foodName}
                onChangeText={(text) => setNewFood({ ...newFood, foodName: text })}
                placeholder="Enter food name"
                autoFocus
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Serving</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFood.serving.toString()}
                  onChangeText={(text) => setNewFood({ ...newFood, serving: parseFloat(text) || 1 })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFood.unit}
                  onChangeText={(text) => setNewFood({ ...newFood, unit: text })}
                  placeholder="serving, cup, oz"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories</Text>
              <TextInput
                style={styles.textInput}
                value={newFood.calories.toString()}
                onChangeText={(text) => setNewFood({ ...newFood, calories: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFood.protein.toString()}
                  onChangeText={(text) => setNewFood({ ...newFood, protein: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newFood.carbs.toString()}
                  onChangeText={(text) => setNewFood({ ...newFood, carbs: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fat (g)</Text>
              <TextInput
                style={styles.textInput}
                value={newFood.fat.toString()}
                onChangeText={(text) => setNewFood({ ...newFood, fat: parseFloat(text) || 0 })}
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Water Modal */}
      <Modal visible={showWaterModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWaterModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Water</Text>
            <TouchableOpacity onPress={handleAddWater}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (ml)</Text>
              <TextInput
                style={styles.textInput}
                value={waterAmount}
                onChangeText={setWaterAmount}
                keyboardType="numeric"
                placeholder="250"
              />
            </View>
            
            <View style={styles.quickWaterButtons}>
              {[250, 500, 750, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickWaterButton}
                  onPress={() => setWaterAmount(amount.toString())}
                >
                  <Text style={styles.quickWaterButtonText}>{amount}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  calorieCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calorieTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  calorieContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  progressCircleContainer: {
    position: 'relative',
  },
  progressCircleBackground: {
    backgroundColor: COLORS.border,
  },
  progressCircleForeground: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressCircleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  progressUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  calorieStats: {
    flex: 1,
  },
  calorieStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  calorieStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calorieStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  macrosCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macrosTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  macroBar: {
    marginBottom: SPACING.md,
  },
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  macroBarLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  macroBarValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  macroBarTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  macroBarProgress: {
    height: '100%',
    borderRadius: 4,
  },
  macroBarPercentage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  waterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  waterTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addWaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  addWaterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  waterProgress: {
    marginBottom: SPACING.md,
  },
  waterProgressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  waterProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  waterProgressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  waterEntries: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  waterEntry: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  waterEntryAmount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  waterEntryTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  mealsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  mealSection: {
    marginBottom: SPACING.lg,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  mealTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mealCalories: {
    marginRight: SPACING.md,
  },
  mealCaloriesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  addMealButton: {
    padding: SPACING.xs,
  },
  mealEntries: {
    paddingLeft: SPACING.xl,
  },
  foodEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodEntryInfo: {
    flex: 1,
  },
  foodEntryName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  foodEntryServing: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  foodEntryCalories: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  noMealsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingLeft: SPACING.xl,
  },
  streaksCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streaksTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  streakLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
  },
  quickWaterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
  },
  quickWaterButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickWaterButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default NutritionScreen;
