import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  tags: string[];
  isFromInfluencer?: boolean;
  influencerId?: string;
  rating?: number;
  reviews?: number;
}

export interface WeeklyMealPlan {
  id: string;
  name: string;
  startDate: string;
  meals: {
    [day: string]: {
      breakfast?: Meal;
      lunch?: Meal;
      dinner?: Meal;
      snacks?: Meal[];
    };
  };
  totalCalories: number;
  totalCost: number;
  isActive: boolean;
}

export interface DietaryPreferences {
  restrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface MealPlanState {
  currentWeekPlan: WeeklyMealPlan | null;
  savedPlans: WeeklyMealPlan[];
  availableMeals: Meal[];
  dietaryPreferences: DietaryPreferences;
  mealHistory: Meal[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  filters: {
    mealType: string | null;
    difficulty: string | null;
    maxPrepTime: number | null;
    cuisine: string | null;
    dietary: string | null;
  };
  searchQuery: string;
  selectedDate: string;
}

const initialState: MealPlanState = {
  currentWeekPlan: null,
  savedPlans: [],
  availableMeals: [],
  dietaryPreferences: {
    restrictions: [],
    allergies: [],
    preferredCuisines: [],
    dislikedIngredients: [],
    calorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 200,
    fatGoal: 65,
  },
  mealHistory: [],
  favorites: [],
  isLoading: false,
  error: null,
  filters: {
    mealType: null,
    difficulty: null,
    maxPrepTime: null,
    cuisine: null,
    dietary: null,
  },
  searchQuery: '',
  selectedDate: new Date().toISOString().split('T')[0],
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setCurrentWeekPlan: (state, action: PayloadAction<WeeklyMealPlan>) => {
      state.currentWeekPlan = action.payload;
    },
    createNewWeekPlan: (state, action: PayloadAction<{ name: string; startDate: string }>) => {
      const newPlan: WeeklyMealPlan = {
        id: Date.now().toString(),
        name: action.payload.name,
        startDate: action.payload.startDate,
        meals: {
          monday: {},
          tuesday: {},
          wednesday: {},
          thursday: {},
          friday: {},
          saturday: {},
          sunday: {},
        },
        totalCalories: 0,
        totalCost: 0,
        isActive: true,
      };
      state.currentWeekPlan = newPlan;
      state.savedPlans.push(newPlan);
    },
    addMealToPlan: (state, action: PayloadAction<{ day: string; mealType: string; meal: Meal }>) => {
      const { day, mealType, meal } = action.payload;
      if (state.currentWeekPlan && state.currentWeekPlan.meals[day]) {
        if (mealType === 'snacks') {
          if (!state.currentWeekPlan.meals[day].snacks) {
            state.currentWeekPlan.meals[day].snacks = [];
          }
          state.currentWeekPlan.meals[day].snacks!.push(meal);
        } else {
          (state.currentWeekPlan.meals[day] as any)[mealType] = meal;
        }
        state.currentWeekPlan.totalCalories += meal.nutritionInfo.calories;
      }
    },
    removeMealFromPlan: (state, action: PayloadAction<{ day: string; mealType: string; mealId?: string }>) => {
      const { day, mealType, mealId } = action.payload;
      if (state.currentWeekPlan && state.currentWeekPlan.meals[day]) {
        if (mealType === 'snacks' && mealId) {
          const snacks = state.currentWeekPlan.meals[day].snacks || [];
          const mealIndex = snacks.findIndex(meal => meal.id === mealId);
          if (mealIndex !== -1) {
            const removedMeal = snacks.splice(mealIndex, 1)[0];
            state.currentWeekPlan.totalCalories -= removedMeal.nutritionInfo.calories;
          }
        } else {
          const meal = (state.currentWeekPlan.meals[day] as any)[mealType];
          if (meal) {
            state.currentWeekPlan.totalCalories -= meal.nutritionInfo.calories;
            (state.currentWeekPlan.meals[day] as any)[mealType] = undefined;
          }
        }
      }
    },
    setAvailableMeals: (state, action: PayloadAction<Meal[]>) => {
      state.availableMeals = action.payload;
    },
    addMealToAvailable: (state, action: PayloadAction<Meal>) => {
      state.availableMeals.push(action.payload);
    },
    updateDietaryPreferences: (state, action: PayloadAction<Partial<DietaryPreferences>>) => {
      state.dietaryPreferences = { ...state.dietaryPreferences, ...action.payload };
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    addToMealHistory: (state, action: PayloadAction<Meal>) => {
      state.mealHistory.unshift(action.payload);
      if (state.mealHistory.length > 50) {
        state.mealHistory = state.mealHistory.slice(0, 50);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<MealPlanState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    savePlan: (state, action: PayloadAction<WeeklyMealPlan>) => {
      const existingIndex = state.savedPlans.findIndex(plan => plan.id === action.payload.id);
      if (existingIndex !== -1) {
        state.savedPlans[existingIndex] = action.payload;
      } else {
        state.savedPlans.push(action.payload);
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.savedPlans = state.savedPlans.filter(plan => plan.id !== action.payload);
      if (state.currentWeekPlan?.id === action.payload) {
        state.currentWeekPlan = null;
      }
    },
    duplicatePlan: (state, action: PayloadAction<{ planId: string; newStartDate: string }>) => {
      const originalPlan = state.savedPlans.find(plan => plan.id === action.payload.planId);
      if (originalPlan) {
        const duplicatedPlan: WeeklyMealPlan = {
          ...originalPlan,
          id: Date.now().toString(),
          name: `${originalPlan.name} (Copy)`,
          startDate: action.payload.newStartDate,
          isActive: false,
        };
        state.savedPlans.push(duplicatedPlan);
      }
    },
    generateShoppingList: (state) => {
      // This would typically dispatch to grocery list slice
      // Implementation would extract ingredients from current week plan
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
  setCurrentWeekPlan,
  createNewWeekPlan,
  addMealToPlan,
  removeMealFromPlan,
  setAvailableMeals,
  addMealToAvailable,
  updateDietaryPreferences,
  addToFavorites,
  removeFromFavorites,
  addToMealHistory,
  setFilters,
  setSearchQuery,
  setSelectedDate,
  savePlan,
  deletePlan,
  duplicatePlan,
  generateShoppingList,
  setLoading,
  setError,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;
