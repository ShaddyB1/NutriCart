import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  store?: string;
  isCompleted: boolean;
  notes?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  priceLevel: 'Low' | 'Medium' | 'High';
}

export interface PriceComparison {
  itemId: string;
  stores: Array<{
    storeId: string;
    storeName: string;
    price: number;
    availability: boolean;
    discount?: number;
  }>;
}

export interface GroceryListState {
  items: GroceryItem[];
  categories: string[];
  stores: Store[];
  priceComparisons: PriceComparison[];
  selectedStore: string | null;
  totalBudget: number;
  currentTotal: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    completed: boolean | null;
    store: string | null;
  };
  sortBy: 'name' | 'category' | 'price' | 'store';
  sortOrder: 'asc' | 'desc';
}

const initialState: GroceryListState = {
  items: [],
  categories: [
    'Fruits & Vegetables',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Pantry Staples',
    'Frozen Foods',
    'Beverages',
    'Snacks',
    'Health & Beauty',
    'Household',
    'Other'
  ],
  stores: [],
  priceComparisons: [],
  selectedStore: null,
  totalBudget: 0,
  currentTotal: 0,
  isLoading: false,
  error: null,
  filters: {
    category: null,
    completed: null,
    store: null,
  },
  sortBy: 'name',
  sortOrder: 'asc',
};

const groceryListSlice = createSlice({
  name: 'groceryList',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<GroceryItem, 'id' | 'isCompleted'>>) => {
      const newItem: GroceryItem = {
        ...action.payload,
        id: Date.now().toString(),
        isCompleted: false,
      };
      state.items.push(newItem);
      state.currentTotal += (newItem.price || 0) * newItem.quantity;
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<GroceryItem> }>) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const oldPrice = (state.items[itemIndex].price || 0) * state.items[itemIndex].quantity;
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
        const newPrice = (state.items[itemIndex].price || 0) * state.items[itemIndex].quantity;
        state.currentTotal = state.currentTotal - oldPrice + newPrice;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        state.currentTotal -= (item.price || 0) * item.quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    toggleItemCompleted: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.isCompleted = !item.isCompleted;
      }
    },
    clearCompletedItems: (state) => {
      const completedItems = state.items.filter(item => item.isCompleted);
      completedItems.forEach(item => {
        state.currentTotal -= (item.price || 0) * item.quantity;
      });
      state.items = state.items.filter(item => !item.isCompleted);
    },
    setStores: (state, action: PayloadAction<Store[]>) => {
      state.stores = action.payload;
    },
    setSelectedStore: (state, action: PayloadAction<string | null>) => {
      state.selectedStore = action.payload;
    },
    setPriceComparisons: (state, action: PayloadAction<PriceComparison[]>) => {
      state.priceComparisons = action.payload;
    },
    setBudget: (state, action: PayloadAction<number>) => {
      state.totalBudget = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GroceryListState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSorting: (state, action: PayloadAction<{ sortBy: GroceryListState['sortBy']; sortOrder: GroceryListState['sortOrder'] }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearList: (state) => {
      state.items = [];
      state.currentTotal = 0;
    },
    addCustomCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    importFromMealPlan: (state, action: PayloadAction<GroceryItem[]>) => {
      action.payload.forEach(item => {
        const existingItem = state.items.find(existing => 
          existing.name.toLowerCase() === item.name.toLowerCase() && 
          existing.category === item.category
        );
        
        if (existingItem) {
          existingItem.quantity += item.quantity;
          state.currentTotal += (item.price || 0) * item.quantity;
        } else {
          const newItem: GroceryItem = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            isCompleted: false,
          };
          state.items.push(newItem);
          state.currentTotal += (newItem.price || 0) * newItem.quantity;
        }
      });
    },
  },
});

export const {
  addItem,
  updateItem,
  removeItem,
  toggleItemCompleted,
  clearCompletedItems,
  setStores,
  setSelectedStore,
  setPriceComparisons,
  setBudget,
  setFilters,
  setSorting,
  setLoading,
  setError,
  clearList,
  addCustomCategory,
  importFromMealPlan,
} = groceryListSlice.actions;

export default groceryListSlice.reducer;
