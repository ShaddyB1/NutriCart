import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface MealPlan {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  difficulty: string;
  calories: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
}

interface Influencer {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  rating: number;
  specialties: string[];
  achievements: Achievement[];
  mealPlans: MealPlan[];
  isFollowing: boolean;
  isVerified: boolean;
  joinedDate: string;
  location: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

interface InfluencerState {
  influencers: Influencer[];
  followedInfluencers: string[];
  currentUser: Influencer | null;
  purchasedMealPlans: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InfluencerState = {
  influencers: [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      bio: 'Certified nutritionist specializing in plant-based diets and sustainable eating. Helping you transform your relationship with food through science-backed nutrition.',
      followers: 125000,
      following: 450,
      rating: 4.8,
      specialties: ['Vegan', 'Fitness', 'Weight Loss'],
      achievements: [
        { id: '1', title: 'Top Nutrition Expert 2024', description: 'Recognized for outstanding contribution to nutrition education', icon: 'trophy', dateEarned: '2024-01-15' },
        { id: '2', title: 'Plant-Based Pioneer', description: 'Leading advocate for plant-based nutrition', icon: 'leaf', dateEarned: '2023-06-10' },
      ],
      mealPlans: [
        {
          id: 'mp1',
          title: '30-Day Plant Power',
          description: 'Complete plant-based meal plan for beginners',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
          price: 29.99,
          duration: '30 days',
          difficulty: 'Beginner',
          calories: 1800,
          ingredients: ['Quinoa', 'Black beans', 'Avocado', 'Spinach'],
          instructions: ['Prep vegetables', 'Cook quinoa', 'Assemble bowl'],
          tags: ['vegan', 'high-protein', 'fiber-rich'],
        },
        {
          id: 'mp2',
          title: 'Green Smoothie Challenge',
          description: '21 days of nutritious green smoothies',
          image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300',
          price: 0,
          duration: '21 days',
          difficulty: 'Easy',
          calories: 250,
          ingredients: ['Spinach', 'Banana', 'Almond milk', 'Chia seeds'],
          instructions: ['Blend all ingredients', 'Add ice if desired'],
          tags: ['detox', 'energy-boost', 'antioxidants'],
        },
      ],
      isFollowing: false,
      isVerified: true,
      joinedDate: '2022-03-15',
      location: 'Los Angeles, CA',
      website: 'sarahnutrition.com',
      socialMedia: {
        instagram: '@sarahnutrition',
        youtube: 'Sarah Johnson Nutrition',
      },
    },
    {
      id: '2',
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Fitness coach and nutrition expert focused on building lean muscle through smart eating. Former Olympic athlete turned nutrition scientist.',
      followers: 89000,
      following: 320,
      rating: 4.9,
      specialties: ['Fitness', 'Muscle Building', 'Sports Nutrition'],
      achievements: [
        { id: '3', title: 'Fitness Influencer of the Year', description: 'Top fitness content creator', icon: 'medal', dateEarned: '2023-12-01' },
      ],
      mealPlans: [
        {
          id: 'mp3',
          title: 'Lean Muscle Builder',
          description: 'High-protein meal plan for muscle growth',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
          price: 39.99,
          duration: '8 weeks',
          difficulty: 'Intermediate',
          calories: 2200,
          ingredients: ['Chicken breast', 'Sweet potato', 'Broccoli', 'Brown rice'],
          instructions: ['Grill chicken', 'Roast vegetables', 'Combine with rice'],
          tags: ['high-protein', 'muscle-building', 'post-workout'],
        },
      ],
      isFollowing: false,
      isVerified: true,
      joinedDate: '2021-08-22',
      location: 'Austin, TX',
      socialMedia: {
        instagram: '@marcusfitnutrition',
        youtube: 'Marcus Chen Fitness',
      },
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      bio: 'Mediterranean diet specialist and cookbook author. Bringing authentic Mediterranean flavors to modern healthy eating.',
      followers: 67000,
      following: 180,
      rating: 4.7,
      specialties: ['Mediterranean', 'Family', 'Heart Health'],
      achievements: [
        { id: '4', title: 'Cookbook Bestseller', description: 'Published bestselling Mediterranean cookbook', icon: 'book', dateEarned: '2023-09-15' },
      ],
      mealPlans: [
        {
          id: 'mp4',
          title: 'Mediterranean Family Feast',
          description: 'Family-friendly Mediterranean meals',
          image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
          price: 24.99,
          duration: '4 weeks',
          difficulty: 'Easy',
          calories: 1900,
          ingredients: ['Olive oil', 'Tomatoes', 'Feta cheese', 'Herbs'],
          instructions: ['Prepare fresh ingredients', 'Drizzle with olive oil'],
          tags: ['heart-healthy', 'family-friendly', 'traditional'],
        },
      ],
      isFollowing: true,
      isVerified: true,
      joinedDate: '2022-01-10',
      location: 'Barcelona, Spain',
      website: 'mediterraneanelena.com',
      socialMedia: {
        instagram: '@elena_mediterranean',
      },
    },
  ],
  followedInfluencers: ['3'],
  currentUser: null,
  purchasedMealPlans: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const loadInfluencers = createAsyncThunk(
  'influencer/loadInfluencers',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initialState.influencers;
    } catch (error) {
      return rejectWithValue('Failed to load influencers');
    }
  }
);

export const followInfluencer = createAsyncThunk(
  'influencer/followInfluencer',
  async (influencerId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return influencerId;
    } catch (error) {
      return rejectWithValue('Failed to follow influencer');
    }
  }
);

export const unfollowInfluencer = createAsyncThunk(
  'influencer/unfollowInfluencer',
  async (influencerId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return influencerId;
    } catch (error) {
      return rejectWithValue('Failed to unfollow influencer');
    }
  }
);

export const updateInfluencerProfile = createAsyncThunk(
  'influencer/updateInfluencerProfile',
  async ({ id, updates }: { id: string; updates: Partial<Influencer> }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, updates };
    } catch (error) {
      return rejectWithValue('Failed to update profile');
    }
  }
);

export const purchaseMealPlan = createAsyncThunk(
  'influencer/purchaseMealPlan',
  async (mealPlanId: string, { rejectWithValue }) => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return mealPlanId;
    } catch (error) {
      return rejectWithValue('Failed to purchase meal plan');
    }
  }
);

const influencerSlice = createSlice({
  name: 'influencer',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<Influencer>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMealPlan: (state, action: PayloadAction<{ influencerId: string; mealPlan: MealPlan }>) => {
      const { influencerId, mealPlan } = action.payload;
      const influencer = state.influencers.find(inf => inf.id === influencerId);
      if (influencer) {
        influencer.mealPlans.push(mealPlan);
      }
    },
    updateMealPlan: (state, action: PayloadAction<{ influencerId: string; mealPlanId: string; updates: Partial<MealPlan> }>) => {
      const { influencerId, mealPlanId, updates } = action.payload;
      const influencer = state.influencers.find(inf => inf.id === influencerId);
      if (influencer) {
        const mealPlan = influencer.mealPlans.find(mp => mp.id === mealPlanId);
        if (mealPlan) {
          Object.assign(mealPlan, updates);
        }
      }
    },
    deleteMealPlan: (state, action: PayloadAction<{ influencerId: string; mealPlanId: string }>) => {
      const { influencerId, mealPlanId } = action.payload;
      const influencer = state.influencers.find(inf => inf.id === influencerId);
      if (influencer) {
        influencer.mealPlans = influencer.mealPlans.filter(mp => mp.id !== mealPlanId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load influencers
      .addCase(loadInfluencers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadInfluencers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.influencers = action.payload;
      })
      .addCase(loadInfluencers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Follow influencer
      .addCase(followInfluencer.fulfilled, (state, action) => {
        const influencerId = action.payload;
        state.followedInfluencers.push(influencerId);
        
        // Update influencer's following status
        const influencer = state.influencers.find(inf => inf.id === influencerId);
        if (influencer) {
          influencer.isFollowing = true;
          influencer.followers += 1;
        }
      })
      
      // Unfollow influencer
      .addCase(unfollowInfluencer.fulfilled, (state, action) => {
        const influencerId = action.payload;
        state.followedInfluencers = state.followedInfluencers.filter(id => id !== influencerId);
        
        // Update influencer's following status
        const influencer = state.influencers.find(inf => inf.id === influencerId);
        if (influencer) {
          influencer.isFollowing = false;
          influencer.followers -= 1;
        }
      })
      
      // Update influencer profile
      .addCase(updateInfluencerProfile.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const influencer = state.influencers.find(inf => inf.id === id);
        if (influencer) {
          Object.assign(influencer, updates);
        }
        
        // Update current user if it's their profile
        if (state.currentUser && state.currentUser.id === id) {
          Object.assign(state.currentUser, updates);
        }
      })
      
      // Purchase meal plan
      .addCase(purchaseMealPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(purchaseMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        const mealPlanId = action.payload;
        if (!state.purchasedMealPlans.includes(mealPlanId)) {
          state.purchasedMealPlans.push(mealPlanId);
        }
      })
      .addCase(purchaseMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentUser,
  clearError,
  addMealPlan,
  updateMealPlan,
  deleteMealPlan,
} = influencerSlice.actions;

export default influencerSlice.reducer;
