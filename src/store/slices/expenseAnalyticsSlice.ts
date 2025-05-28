import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define the interface for the expense analytics response
export interface ExpenseAnalytics {
  businessId: string;
  analytics: string;
  timestamp: string;
}

// Define the state interface
interface ExpenseAnalyticsState {
  data: ExpenseAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ExpenseAnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch the expense analytics
export const fetchExpenseAnalytics = createAsyncThunk(
  'expenseAnalytics/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AI.EXPENSE_ANALYTICS, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return rejectWithValue('No expense data available for analysis');
        }
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch expense analytics');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching expense analytics');
    }
  }
);

// Create the slice
const expenseAnalyticsSlice = createSlice({
  name: 'expenseAnalytics',
  initialState,
  reducers: {
    clearExpenseAnalytics: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExpenseAnalytics } = expenseAnalyticsSlice.actions;
export default expenseAnalyticsSlice.reducer;
