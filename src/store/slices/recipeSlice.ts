import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  mealType: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
    imageUrl?: string;
    timer?: number;
  }>;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  tags: string[];
  dietaryRestrictions: string[];
  rating: number;
  reviewCount: number;
  createdBy: string;
  createdAt: string;
  isFromInfluencer?: boolean;
  influencerId?: string;
  isPremium?: boolean;
}

export interface RecipeState {
  recipes: Recipe[];
  favorites: string[];
  recentlyViewed: string[];
  searchQuery: string;
  filters: {
    cuisine: string[];
    mealType: string[];
    difficulty: string | null;
    maxPrepTime: number | null;
    maxCookTime: number | null;
    dietaryRestrictions: string[];
    rating: number | null;
  };
  sortBy: 'name' | 'rating' | 'prepTime' | 'cookTime' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  categories: {
    cuisines: string[];
    mealTypes: string[];
    dietaryRestrictions: string[];
    tags: string[];
  };
}

const initialState: RecipeState = {
  recipes: [],
  favorites: [],
  recentlyViewed: [],
  searchQuery: '',
  filters: {
    cuisine: [],
    mealType: [],
    difficulty: null,
    maxPrepTime: null,
    maxCookTime: null,
    dietaryRestrictions: [],
    rating: null,
  },
  sortBy: 'rating',
  sortOrder: 'desc',
  selectedRecipe: null,
  isLoading: false,
  error: null,
  categories: {
    cuisines: [
      'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 
      'Indian', 'French', 'Japanese', 'Thai', 'Chinese', 'Other'
    ],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'],
    dietaryRestrictions: [
      'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
      'Paleo', 'Low-Carb', 'Low-Fat', 'Nut-Free', 'Soy-Free'
    ],
    tags: [
      'Quick', 'Easy', 'Healthy', 'Comfort Food', 'Spicy', 'Sweet', 
      'Savory', 'One-Pot', 'Make-Ahead', 'Kid-Friendly'
    ],
  },
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    updateRecipe: (state, action: PayloadAction<{ id: string; updates: Partial<Recipe> }>) => {
      const { id, updates } = action.payload;
      const recipeIndex = state.recipes.findIndex(recipe => recipe.id === id);
      if (recipeIndex !== -1) {
        state.recipes[recipeIndex] = { ...state.recipes[recipeIndex], ...updates };
      }
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
      state.favorites = state.favorites.filter(id => id !== action.payload);
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== action.payload);
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
      if (action.payload && !state.recentlyViewed.includes(action.payload.id)) {
        state.recentlyViewed.unshift(action.payload.id);
        if (state.recentlyViewed.length > 20) {
          state.recentlyViewed = state.recentlyViewed.slice(0, 20);
        }
      }
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<RecipeState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        cuisine: [],
        mealType: [],
        difficulty: null,
        maxPrepTime: null,
        maxCookTime: null,
        dietaryRestrictions: [],
        rating: null,
      };
    },
    setSorting: (state, action: PayloadAction<{ sortBy: RecipeState['sortBy']; sortOrder: RecipeState['sortOrder'] }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    rateRecipe: (state, action: PayloadAction<{ recipeId: string; rating: number }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        const totalRating = recipe.rating * recipe.reviewCount;
        recipe.reviewCount += 1;
        recipe.rating = (totalRating + action.payload.rating) / recipe.reviewCount;
      }
    },
    scaleRecipe: (state, action: PayloadAction<{ recipeId: string; servings: number }>) => {
      if (state.selectedRecipe && state.selectedRecipe.id === action.payload.recipeId) {
        const scaleFactor = action.payload.servings / state.selectedRecipe.servings;
        state.selectedRecipe = {
          ...state.selectedRecipe,
          servings: action.payload.servings,
          ingredients: state.selectedRecipe.ingredients.map(ingredient => ({
            ...ingredient,
            amount: ingredient.amount * scaleFactor,
          })),
        };
      }
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
  setRecipes,
  addRecipe,
  updateRecipe,
  removeRecipe,
  setSelectedRecipe,
  addToFavorites,
  removeFromFavorites,
  setSearchQuery,
  setFilters,
  clearFilters,
  setSorting,
  rateRecipe,
  scaleRecipe,
  setLoading,
  setError,
} = recipeSlice.actions;

export default recipeSlice.reducer;
