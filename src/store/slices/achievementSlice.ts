import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'meal_planning' | 'grocery' | 'budget' | 'consistency' | 'social';
  type: 'milestone' | 'streak' | 'challenge';
  requirement: {
    type: 'count' | 'streak' | 'percentage' | 'value';
    target: number;
    current: number;
  };
  isUnlocked: boolean;
  unlockedDate?: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  totalMealsPlanned: number;
  totalRecipesTried: number;
  totalGroceryTrips: number;
  totalMoneySaved: number;
  longestNutritionStreak: number;
  longestMealPlanStreak: number;
  totalCaloriesTracked: number;
  totalWaterIntake: number;
  favoriteRecipes: number;
  influencersFollowed: number;
}

export interface AchievementState {
  achievements: Achievement[];
  userStats: UserStats;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  recentUnlocks: Achievement[];
  categories: Array<{
    name: string;
    icon: string;
    unlockedCount: number;
    totalCount: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

const initialAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first meal plan',
    icon: '🎯',
    category: 'meal_planning',
    type: 'milestone',
    requirement: { type: 'count', target: 1, current: 0 },
    isUnlocked: false,
    points: 10,
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Nutrition Tracker',
    description: 'Log your nutrition for 7 days straight',
    icon: '📊',
    category: 'nutrition',
    type: 'streak',
    requirement: { type: 'streak', target: 7, current: 0 },
    isUnlocked: false,
    points: 25,
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'Budget Master',
    description: 'Save $100 with grocery alternatives',
    icon: '💰',
    category: 'budget',
    type: 'milestone',
    requirement: { type: 'value', target: 100, current: 0 },
    isUnlocked: false,
    points: 50,
    rarity: 'epic',
  },
  {
    id: '4',
    title: 'Recipe Explorer',
    description: 'Try 25 different recipes',
    icon: '👨‍🍳',
    category: 'meal_planning',
    type: 'milestone',
    requirement: { type: 'count', target: 25, current: 0 },
    isUnlocked: false,
    points: 30,
    rarity: 'rare',
  },
  {
    id: '5',
    title: 'Hydration Hero',
    description: 'Meet your water goal for 30 days',
    icon: '💧',
    category: 'nutrition',
    type: 'streak',
    requirement: { type: 'streak', target: 30, current: 0 },
    isUnlocked: false,
    points: 75,
    rarity: 'epic',
  },
  {
    id: '6',
    title: 'Social Butterfly',
    description: 'Follow 10 influencers',
    icon: '🦋',
    category: 'social',
    type: 'milestone',
    requirement: { type: 'count', target: 10, current: 0 },
    isUnlocked: false,
    points: 20,
    rarity: 'common',
  },
];

const initialState: AchievementState = {
  achievements: initialAchievements,
  userStats: {
    totalMealsPlanned: 0,
    totalRecipesTried: 0,
    totalGroceryTrips: 0,
    totalMoneySaved: 0,
    longestNutritionStreak: 0,
    longestMealPlanStreak: 0,
    totalCaloriesTracked: 0,
    totalWaterIntake: 0,
    favoriteRecipes: 0,
    influencersFollowed: 0,
  },
  totalPoints: 0,
  currentLevel: 1,
  pointsToNextLevel: 100,
  recentUnlocks: [],
  categories: [
    { name: 'Nutrition', icon: '🥗', unlockedCount: 0, totalCount: 2 },
    { name: 'Meal Planning', icon: '📅', unlockedCount: 0, totalCount: 2 },
    { name: 'Budget', icon: '💰', unlockedCount: 0, totalCount: 1 },
    { name: 'Social', icon: '👥', unlockedCount: 0, totalCount: 1 },
  ],
  isLoading: false,
  error: null,
};

const achievementSlice = createSlice({
  name: 'achievement',
  initialState,
  reducers: {
    updateUserStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      state.userStats = { ...state.userStats, ...action.payload };
      
      // Check for achievement unlocks
      state.achievements.forEach(achievement => {
        if (!achievement.isUnlocked) {
          const statKey = getStatKeyForAchievement(achievement);
          const currentValue = statKey ? (state.userStats as any)[statKey] : 0;
          
          achievement.requirement.current = currentValue;
          
          if (currentValue >= achievement.requirement.target) {
            achievement.isUnlocked = true;
            achievement.unlockedDate = new Date().toISOString();
            state.totalPoints += achievement.points;
            state.recentUnlocks.unshift(achievement);
            
            if (state.recentUnlocks.length > 5) {
              state.recentUnlocks = state.recentUnlocks.slice(0, 5);
            }
            
            // Update category counts
            const category = state.categories.find(c => 
              c.name.toLowerCase().replace(' ', '_') === achievement.category.replace('_', ' ').toLowerCase()
            );
            if (category) {
              category.unlockedCount++;
            }
          }
        }
      });
      
      // Update level
      const newLevel = Math.floor(state.totalPoints / 100) + 1;
      if (newLevel > state.currentLevel) {
        state.currentLevel = newLevel;
      }
      state.pointsToNextLevel = (state.currentLevel * 100) - state.totalPoints;
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload);
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        state.totalPoints += achievement.points;
        state.recentUnlocks.unshift(achievement);
        
        if (state.recentUnlocks.length > 5) {
          state.recentUnlocks = state.recentUnlocks.slice(0, 5);
        }
      }
    },
    addCustomAchievement: (state, action: PayloadAction<Omit<Achievement, 'id' | 'isUnlocked'>>) => {
      const newAchievement: Achievement = {
        ...action.payload,
        id: Date.now().toString(),
        isUnlocked: false,
      };
      state.achievements.push(newAchievement);
    },
    clearRecentUnlocks: (state) => {
      state.recentUnlocks = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Helper function to map achievement to user stat
function getStatKeyForAchievement(achievement: Achievement): keyof UserStats | null {
  switch (achievement.id) {
    case '1': return 'totalMealsPlanned';
    case '3': return 'totalMoneySaved';
    case '4': return 'totalRecipesTried';
    case '6': return 'influencersFollowed';
    default: return null;
  }
}

export const {
  updateUserStats,
  unlockAchievement,
  addCustomAchievement,
  clearRecentUnlocks,
  setLoading,
  setError,
} = achievementSlice.actions;

export default achievementSlice.reducer;
