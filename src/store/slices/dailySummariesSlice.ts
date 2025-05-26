import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define the DailySummary interface
export interface DailySummary {
  id: string;
  description: string;
  timestamp: string;
  businessId: string;
  businessName: string;
}

// Define the state interface
interface DailySummariesState {
  summaries: DailySummary[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DailySummariesState = {
  summaries: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch daily summaries by date
export const fetchDailySummariesByDate = createAsyncThunk(
  'dailySummaries/fetchByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.DAILY_SUMMARIES.GET_BY_DATE(date), {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to fetch daily summaries');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching daily summaries');
    }
  }
);

// Create the slice
const dailySummariesSlice = createSlice({
  name: 'dailySummaries',
  initialState,
  reducers: {
    clearDailySummaries: (state) => {
      state.summaries = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailySummariesByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailySummariesByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both single summary and array of summaries
        if (Array.isArray(action.payload)) {
          state.summaries = action.payload;
        } else {
          state.summaries = [action.payload];
        }
      })
      .addCase(fetchDailySummariesByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDailySummaries } = dailySummariesSlice.actions;
export default dailySummariesSlice.reducer;
