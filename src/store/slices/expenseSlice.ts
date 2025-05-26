import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for expense data
export enum ExpenseCategory {
  OFFICE = 'Office',
  UTILITIES = 'Utilities',
  FOOD = 'Food',
  SOFTWARE = 'Software',
  OTHER = 'Other'
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  note: string;
  category: ExpenseCategory;
  createdAt: string;
  businessId: string;
}

interface ExpensesState {
  items: Expense[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: string; // ISO date string for filtering
  totalAmount: number; // Total amount of expenses for the selected date
}

// Format today's date as ISO string (YYYY-MM-DD)
const today = new Date();
const formattedToday = today.toISOString().split('T')[0];

// Initial state
const initialState: ExpensesState = {
  items: [],
  selectedExpense: null,
  isLoading: false,
  error: null,
  selectedDate: formattedToday,
  totalAmount: 0
};

// Response interface for the API
interface ExpenseApiResponse {
  expenses: Expense[];
  totalAmount: number;
}

// Fetch expenses for the current business and selected date
export const fetchExpenses = createAsyncThunk<ExpenseApiResponse, string, { state: RootState }>(
  'expenses/fetchByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.EXPENSES.GET_BY_DATE}?date=${date}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch expenses';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      return rejectWithValue(error.message || 'Failed to fetch expenses');
    }
  }
);

// Create a new expense
export interface CreateExpenseRequest {
  title: string;
  amount: number;
  note: string;
  category: ExpenseCategory;
}

export const addExpense = createAsyncThunk<Expense, CreateExpenseRequest, { state: RootState }>(
  'expenses/add',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to add expense';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error adding expense:', error);
      return rejectWithValue(error.message || 'Failed to add expense');
    }
  }
);

// Delete an expense
export const deleteExpense = createAsyncThunk<string, string, { state: RootState }>(
  'expenses/delete',
  async (expenseId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        let errorMessage = 'Failed to delete expense';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return expenseId;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      return rejectWithValue(error.message || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.expenses;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add expense
      .addCase(addExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.items = state.items.filter(expense => expense.id !== action.payload);
        if (state.selectedExpense && state.selectedExpense.id === action.payload) {
          state.selectedExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedDate, clearExpenseError, clearSelectedExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
