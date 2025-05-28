import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define the interface for the AI analytics response
export interface AiDailySummary {
  businessId: string;
  summary: string;
  timestamp: string;
}

// Define the state interface
interface AiAnalyticsState {
  dailySummary: AiDailySummary | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AiAnalyticsState = {
  dailySummary: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch the AI daily summary
export const fetchAiDailySummary = createAsyncThunk(
  'aiAnalytics/fetchDailySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AI.BUSINESS_DAILY_SUMMARY, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return rejectWithValue('No AI summary available for this date');
        }
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch AI summary');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching AI summary');
    }
  }
);

// Create the slice
const aiAnalyticsSlice = createSlice({
  name: 'aiAnalytics',
  initialState,
  reducers: {
    clearAiSummary: (state) => {
      state.dailySummary = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiDailySummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAiDailySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailySummary = action.payload;
        state.error = null;
      })
      .addCase(fetchAiDailySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAiSummary } = aiAnalyticsSlice.actions;
export default aiAnalyticsSlice.reducer;
