import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DailyLog } from '@/types/DailyLog';
import type { RootState } from '../index';

// Define auth state interface to avoid circular imports
interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface DailyLogsState {
  logs: DailyLog[];
  filteredLogs: DailyLog[];
  selectedDate: string | null; // ISO date string (YYYY-MM-DD)
  dateRange: {
    from: string | null; // ISO date string
    to: string | null; // ISO date string
  };
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DailyLogsState = {
  logs: [],
  filteredLogs: [],
  selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  dateRange: {
    from: null,
    to: null
  },
  isLoading: false,
  error: null
};

// Async thunks for daily logs operations
export const fetchDailyLogs = createAsyncThunk<DailyLog[], void, { state: RootState }>(
  'dailyLogs/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch('/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch logs');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchLogsByDate = createAsyncThunk<DailyLog[], string, { state: RootState }>(
  'dailyLogs/fetchByDate',
  async (date, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch(`/api/logs/date/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch logs for the selected date');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchLogsByDateRange = createAsyncThunk<
  DailyLog[], 
  { from: string; to: string }, 
  { state: RootState }
>(
  'dailyLogs/fetchByDateRange',
  async ({ from, to }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch(`/api/logs/range?from=${from}&to=${to}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch logs for the selected date range');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create the dailyLogs slice
const dailyLogsSlice = createSlice({
  name: 'dailyLogs',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      // Filter logs for the selected date
      if (state.logs.length > 0) {
        state.filteredLogs = state.logs.filter(log => 
          log.timestamp.startsWith(action.payload)
        );
      }
    },
    setDateRange: (state, action: PayloadAction<{ from: string | null; to: string | null }>) => {
      state.dateRange = action.payload;
      // Clear filtered logs when changing date range
      state.filteredLogs = [];
    },
    clearLogsError: (state) => {
      state.error = null;
    },
    // For demo/development purposes - add mock logs
    addMockLogs: (state, action: PayloadAction<DailyLog[]>) => {
      state.logs = [...state.logs, ...action.payload];
      // Update filtered logs if they match the selected date
      if (state.selectedDate) {
        state.filteredLogs = state.logs.filter(log => 
          log.timestamp.startsWith(state.selectedDate!)
        );
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch all logs
    builder
      .addCase(fetchDailyLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyLogs.fulfilled, (state, action: PayloadAction<DailyLog[]>) => {
        state.isLoading = false;
        state.logs = action.payload;
        // Filter logs for the selected date if one is set
        if (state.selectedDate) {
          state.filteredLogs = action.payload.filter(log => 
            log.timestamp.startsWith(state.selectedDate!)
          );
        } else {
          state.filteredLogs = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchDailyLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch logs by date
    builder
      .addCase(fetchLogsByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogsByDate.fulfilled, (state, action: PayloadAction<DailyLog[]>) => {
        state.isLoading = false;
        state.filteredLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchLogsByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch logs by date range
    builder
      .addCase(fetchLogsByDateRange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogsByDateRange.fulfilled, (state, action: PayloadAction<DailyLog[]>) => {
        state.isLoading = false;
        state.filteredLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchLogsByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setSelectedDate, 
  setDateRange, 
  clearLogsError,
  addMockLogs
} = dailyLogsSlice.actions;

export default dailyLogsSlice.reducer;
