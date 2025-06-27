import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BudgetCategory {
  id: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  color: string;
}

export interface BudgetAlternative {
  id: string;
  originalItem: string;
  alternativeItem: string;
  originalPrice: number;
  alternativePrice: number;
  savings: number;
  store: string;
  category: string;
  nutritionComparison?: {
    calories: { original: number; alternative: number };
    protein: { original: number; alternative: number };
  };
}

export interface BudgetState {
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  alternatives: BudgetAlternative[];
  monthlyBudgets: Array<{
    month: string;
    budget: number;
    spent: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  totalBudget: 500,
  totalSpent: 0,
  categories: [
    { id: '1', name: 'Fruits & Vegetables', budgetAmount: 100, spentAmount: 0, color: '#4CAF50' },
    { id: '2', name: 'Meat & Seafood', budgetAmount: 150, spentAmount: 0, color: '#F44336' },
    { id: '3', name: 'Dairy & Eggs', budgetAmount: 80, spentAmount: 0, color: '#2196F3' },
    { id: '4', name: 'Pantry Staples', budgetAmount: 120, spentAmount: 0, color: '#FF9800' },
    { id: '5', name: 'Other', budgetAmount: 50, spentAmount: 0, color: '#9C27B0' },
  ],
  alternatives: [],
  monthlyBudgets: [],
  isLoading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<number>) => {
      state.totalBudget = action.payload;
    },
    addSpending: (state, action: PayloadAction<{ categoryId: string; amount: number }>) => {
      const category = state.categories.find(c => c.id === action.payload.categoryId);
      if (category) {
        category.spentAmount += action.payload.amount;
        state.totalSpent += action.payload.amount;
      }
    },
    updateCategoryBudget: (state, action: PayloadAction<{ categoryId: string; budget: number }>) => {
      const category = state.categories.find(c => c.id === action.payload.categoryId);
      if (category) {
        const difference = action.payload.budget - category.budgetAmount;
        category.budgetAmount = action.payload.budget;
        state.totalBudget += difference;
      }
    },
    addAlternative: (state, action: PayloadAction<Omit<BudgetAlternative, 'id'>>) => {
      const newAlternative: BudgetAlternative = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.alternatives.push(newAlternative);
    },
    removeAlternative: (state, action: PayloadAction<string>) => {
      state.alternatives = state.alternatives.filter(alt => alt.id !== action.payload);
    },
    resetMonthlyBudget: (state) => {
      state.totalSpent = 0;
      state.categories.forEach(category => {
        category.spentAmount = 0;
      });
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const existingMonth = state.monthlyBudgets.find(m => m.month === currentMonth);
      if (existingMonth) {
        existingMonth.spent = 0;
      } else {
        state.monthlyBudgets.push({
          month: currentMonth,
          budget: state.totalBudget,
          spent: 0,
        });
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
  setBudget,
  addSpending,
  updateCategoryBudget,
  addAlternative,
  removeAlternative,
  resetMonthlyBudget,
  setLoading,
  setError,
} = budgetSlice.actions;

export default budgetSlice.reducer;
