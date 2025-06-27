import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import groceryListSlice from './slices/groceryListSlice';
import mealPlanSlice from './slices/mealPlanSlice';
import nutritionSlice from './slices/nutritionSlice';
import influencerSlice from './slices/influencerSlice';
import budgetSlice from './slices/budgetSlice';
import achievementSlice from './slices/achievementSlice';
import locationSlice from './slices/locationSlice';
import offlineSlice from './slices/offlineSlice';
import recipeSlice from './slices/recipeSlice';

export const store = configureStore({
  reducer: {
    groceryList: groceryListSlice,
    mealPlan: mealPlanSlice,
    nutrition: nutritionSlice,
    influencer: influencerSlice,
    budget: budgetSlice,
    achievement: achievementSlice,
    location: locationSlice,
    offline: offlineSlice,
    recipe: recipeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 