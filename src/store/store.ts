import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import authReducer from './slices/authSlice';
import influencerReducer from './slices/influencerSlice';
import groceryListReducer from './slices/groceryListSlice';
import mealPlanReducer from './slices/mealPlanSlice';
import nutritionReducer from './slices/nutritionSlice';
import recipeReducer from './slices/recipeSlice';
import budgetReducer from './slices/budgetSlice';
import achievementReducer from './slices/achievementSlice';
import locationReducer from './slices/locationSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    influencer: influencerReducer,
    groceryList: groceryListReducer,
    mealPlan: mealPlanReducer,
    nutrition: nutritionReducer,
    recipe: recipeReducer,
    budget: budgetReducer,
    achievement: achievementReducer,
    location: locationReducer,
    offline: offlineReducer,
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