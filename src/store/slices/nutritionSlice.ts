import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  brand?: string;
  serving: number;
  unit: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
  barcode?: string;
  imageUrl?: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  water: number; // in ml
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number;
  mealsLogged: number;
  caloriesBurned?: number;
  netCalories: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

export interface WaterIntake {
  id: string;
  date: string;
  amount: number; // in ml
  time: string;
}

export interface NutritionState {
  entries: NutritionEntry[];
  goals: NutritionGoals;
  dailySummaries: DailyNutritionSummary[];
  weightEntries: WeightEntry[];
  waterIntakes: WaterIntake[];
  selectedDate: string;
  weeklyView: boolean;
  monthlyView: boolean;
  foodDatabase: Array<{
    id: string;
    name: string;
    brand?: string;
    nutritionPer100g: NutritionEntry['nutritionInfo'];
    barcode?: string;
    category: string;
  }>;
  recentFoods: string[];
  favoriteFoods: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    mealType: string | null;
    dateRange: {
      start: string;
      end: string;
    } | null;
  };
  streaks: {
    calorieGoal: number;
    proteinGoal: number;
    waterGoal: number;
    logging: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedDate: string;
    category: 'calorie' | 'protein' | 'water' | 'consistency' | 'weight';
  }>;
}

const initialState: NutritionState = {
  entries: [],
  goals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
    water: 2000,
  },
  dailySummaries: [],
  weightEntries: [],
  waterIntakes: [],
  selectedDate: new Date().toISOString().split('T')[0],
  weeklyView: false,
  monthlyView: false,
  foodDatabase: [],
  recentFoods: [],
  favoriteFoods: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {
    mealType: null,
    dateRange: null,
  },
  streaks: {
    calorieGoal: 0,
    proteinGoal: 0,
    waterGoal: 0,
    logging: 0,
  },
  achievements: [],
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    addNutritionEntry: (state, action: PayloadAction<Omit<NutritionEntry, 'id'>>) => {
      const newEntry: NutritionEntry = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.entries.push(newEntry);
      
      // Add to recent foods
      if (!state.recentFoods.includes(newEntry.foodName)) {
        state.recentFoods.unshift(newEntry.foodName);
        if (state.recentFoods.length > 20) {
          state.recentFoods = state.recentFoods.slice(0, 20);
        }
      }
      
      // Update daily summary
      nutritionSlice.caseReducers.updateDailySummary(state, { payload: action.payload.date, type: 'updateDailySummary' });
    },
    updateNutritionEntry: (state, action: PayloadAction<{ id: string; updates: Partial<NutritionEntry> }>) => {
      const { id, updates } = action.payload;
      const entryIndex = state.entries.findIndex(entry => entry.id === id);
      if (entryIndex !== -1) {
        const oldDate = state.entries[entryIndex].date;
        state.entries[entryIndex] = { ...state.entries[entryIndex], ...updates };
        
        // Update daily summaries for both old and new dates
        nutritionSlice.caseReducers.updateDailySummary(state, { payload: oldDate, type: 'updateDailySummary' });
        if (updates.date && updates.date !== oldDate) {
          nutritionSlice.caseReducers.updateDailySummary(state, { payload: updates.date, type: 'updateDailySummary' });
        }
      }
    },
    removeNutritionEntry: (state, action: PayloadAction<string>) => {
      const entryIndex = state.entries.findIndex(entry => entry.id === action.payload);
      if (entryIndex !== -1) {
        const removedEntry = state.entries[entryIndex];
        state.entries.splice(entryIndex, 1);
        nutritionSlice.caseReducers.updateDailySummary(state, { payload: removedEntry.date, type: 'updateDailySummary' });
      }
    },
    updateNutritionGoals: (state, action: PayloadAction<Partial<NutritionGoals>>) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    addWaterIntake: (state, action: PayloadAction<Omit<WaterIntake, 'id'>>) => {
      const newIntake: WaterIntake = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.waterIntakes.push(newIntake);
      nutritionSlice.caseReducers.updateDailySummary(state, { payload: action.payload.date, type: 'updateDailySummary' });
    },
    removeWaterIntake: (state, action: PayloadAction<string>) => {
      const intakeIndex = state.waterIntakes.findIndex(intake => intake.id === action.payload);
      if (intakeIndex !== -1) {
        const removedIntake = state.waterIntakes[intakeIndex];
        state.waterIntakes.splice(intakeIndex, 1);
        nutritionSlice.caseReducers.updateDailySummary(state, { payload: removedIntake.date, type: 'updateDailySummary' });
      }
    },
    addWeightEntry: (state, action: PayloadAction<Omit<WeightEntry, 'id'>>) => {
      const newEntry: WeightEntry = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.weightEntries.push(newEntry);
      state.weightEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    updateWeightEntry: (state, action: PayloadAction<{ id: string; updates: Partial<WeightEntry> }>) => {
      const { id, updates } = action.payload;
      const entryIndex = state.weightEntries.findIndex(entry => entry.id === id);
      if (entryIndex !== -1) {
        state.weightEntries[entryIndex] = { ...state.weightEntries[entryIndex], ...updates };
        state.weightEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    },
    removeWeightEntry: (state, action: PayloadAction<string>) => {
      state.weightEntries = state.weightEntries.filter(entry => entry.id !== action.payload);
    },
    updateDailySummary: (state, action: PayloadAction<string>) => {
      const date = action.payload;
      const dayEntries = state.entries.filter(entry => entry.date === date);
      const dayWaterIntakes = state.waterIntakes.filter(intake => intake.date === date);
      
      const summary: DailyNutritionSummary = {
        date,
        totalCalories: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.calories, 0),
        totalProtein: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.protein, 0),
        totalCarbs: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.carbs, 0),
        totalFat: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.fat, 0),
        totalFiber: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.fiber, 0),
        totalSugar: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.sugar, 0),
        totalSodium: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.sodium, 0),
        waterIntake: dayWaterIntakes.reduce((sum, intake) => sum + intake.amount, 0),
        mealsLogged: dayEntries.length,
        netCalories: dayEntries.reduce((sum, entry) => sum + entry.nutritionInfo.calories, 0),
      };
      
      const existingIndex = state.dailySummaries.findIndex(s => s.date === date);
      if (existingIndex !== -1) {
        state.dailySummaries[existingIndex] = summary;
      } else {
        state.dailySummaries.push(summary);
      }
      
      state.dailySummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setViewMode: (state, action: PayloadAction<{ weekly?: boolean; monthly?: boolean }>) => {
      if (action.payload.weekly !== undefined) {
        state.weeklyView = action.payload.weekly;
      }
      if (action.payload.monthly !== undefined) {
        state.monthlyView = action.payload.monthly;
      }
    },
    setFoodDatabase: (state, action: PayloadAction<NutritionState['foodDatabase']>) => {
      state.foodDatabase = action.payload;
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favoriteFoods.includes(action.payload)) {
        state.favoriteFoods.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteFoods = state.favoriteFoods.filter(food => food !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<NutritionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateStreaks: (state) => {
      // Calculate streaks based on recent daily summaries
      const today = new Date().toISOString().split('T')[0];
      const recentSummaries = state.dailySummaries
        .filter(summary => summary.date <= today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate calorie goal streak
      let calorieStreak = 0;
      for (const summary of recentSummaries) {
        if (summary.totalCalories >= state.goals.calories * 0.9 && summary.totalCalories <= state.goals.calories * 1.1) {
          calorieStreak++;
        } else {
          break;
        }
      }
      
      // Calculate protein goal streak
      let proteinStreak = 0;
      for (const summary of recentSummaries) {
        if (summary.totalProtein >= state.goals.protein * 0.8) {
          proteinStreak++;
        } else {
          break;
        }
      }
      
      // Calculate water goal streak
      let waterStreak = 0;
      for (const summary of recentSummaries) {
        if (summary.waterIntake >= state.goals.water) {
          waterStreak++;
        } else {
          break;
        }
      }
      
      // Calculate logging streak
      let loggingStreak = 0;
      for (const summary of recentSummaries) {
        if (summary.mealsLogged >= 3) {
          loggingStreak++;
        } else {
          break;
        }
      }
      
      state.streaks = {
        calorieGoal: calorieStreak,
        proteinGoal: proteinStreak,
        waterGoal: waterStreak,
        logging: loggingStreak,
      };
    },
    addAchievement: (state, action: PayloadAction<Omit<NutritionState['achievements'][0], 'unlockedDate'>>) => {
      const achievement = {
        ...action.payload,
        unlockedDate: new Date().toISOString(),
      };
      state.achievements.push(achievement);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addNutritionEntry,
  updateNutritionEntry,
  removeNutritionEntry,
  updateNutritionGoals,
  addWaterIntake,
  removeWaterIntake,
  addWeightEntry,
  updateWeightEntry,
  removeWeightEntry,
  updateDailySummary,
  setSelectedDate,
  setViewMode,
  setFoodDatabase,
  addToFavorites,
  removeFromFavorites,
  setSearchQuery,
  setFilters,
  updateStreaks,
  addAchievement,
  setLoading,
  setError,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
