import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'influencer' | 'admin';
  avatar?: string;
  isVerified: boolean;
  influencerProfile?: {
    bio: string;
    specialties: string[];
    followers: number;
    rating: number;
  };
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  currentUser: {
    id: '1',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    role: 'influencer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    isVerified: true,
    influencerProfile: {
      bio: 'Certified nutritionist specializing in plant-based diets',
      specialties: ['Vegan', 'Fitness', 'Weight Loss'],
      followers: 125000,
      rating: 4.8,
    },
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  token: 'mock-jwt-token',
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const mockUsers = [
        {
          id: '1',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          role: 'influencer' as const,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          isVerified: true,
          influencerProfile: {
            bio: 'Certified nutritionist specializing in plant-based diets',
            specialties: ['Vegan', 'Fitness', 'Weight Loss'],
            followers: 125000,
            rating: 4.8,
          },
        },
        {
          id: '2',
          email: 'marcus@example.com',
          name: 'Marcus Chen',
          role: 'influencer' as const,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          isVerified: true,
          influencerProfile: {
            bio: 'Fitness coach and nutrition expert',
            specialties: ['Fitness', 'Muscle Building', 'Sports Nutrition'],
            followers: 89000,
            rating: 4.9,
          },
        },
        {
          id: '3',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user' as const,
          isVerified: false,
        },
      ];

      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      return {
        user,
        token: 'mock-jwt-token-' + user.id,
      };
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const registerInfluencer = createAsyncThunk(
  'auth/registerInfluencer',
  async (registrationData: {
    email: string;
    password: string;
    name: string;
    bio: string;
    specialties: string[];
  }, { rejectWithValue }) => {
    try {
      // In a real app, this would create an influencer account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newInfluencer = {
        id: Date.now().toString(),
        email: registrationData.email,
        name: registrationData.name,
        role: 'influencer' as const,
        isVerified: false, // Requires admin approval
        influencerProfile: {
          bio: registrationData.bio,
          specialties: registrationData.specialties,
          followers: 0,
          rating: 0,
        },
      };

      return {
        user: newInfluencer,
        token: 'mock-jwt-token-' + newInfluencer.id,
      };
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const verifyInfluencer = createAsyncThunk(
  'auth/verifyInfluencer',
  async (influencerId: string, { rejectWithValue }) => {
    try {
      // Admin-only action to verify influencers
      await new Promise(resolve => setTimeout(resolve, 1000));
      return influencerId;
    } catch (error) {
      return rejectWithValue('Verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        Object.assign(state.currentUser, action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register influencer
      .addCase(registerInfluencer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerInfluencer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerInfluencer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Verify influencer
      .addCase(verifyInfluencer.fulfilled, (state, action) => {
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser.isVerified = true;
        }
      });
  },
});

export const { logout, clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.currentUser;
export const selectIsInfluencer = (state: { auth: AuthState }) => 
  state.auth.currentUser?.role === 'influencer';
export const selectCanEditProfile = (state: { auth: AuthState }, profileId: string) =>
  state.auth.currentUser?.id === profileId && state.auth.currentUser?.role === 'influencer'; 