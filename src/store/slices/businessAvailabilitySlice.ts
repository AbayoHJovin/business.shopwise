import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for business availability
export interface BusinessAvailabilityState {
  isOpen: boolean;
  businessId: string | null;
  businessName: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: BusinessAvailabilityState = {
  isOpen: false,
  businessId: null,
  businessName: null,
  isLoading: false,
  error: null
};

// Get business availability status
export const getBusinessAvailability = createAsyncThunk<
  { businessId: string; businessName: string; open: boolean },
  void,
  { state: RootState }
>('businessAvailability/get', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.BUSINESS.AVAILABILITY.GET, {
      ...DEFAULT_REQUEST_OPTIONS,
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Failed to get business availability';
      
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error getting business availability:', error);
    return rejectWithValue(error.message || 'Failed to get business availability');
  }
});

// Update business availability status
export const updateBusinessAvailability = createAsyncThunk<
  { businessId: string; businessName: string; open: boolean },
  boolean,
  { state: RootState }
>('businessAvailability/update', async (isOpen, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.BUSINESS.AVAILABILITY.UPDATE, {
      ...DEFAULT_REQUEST_OPTIONS,
      method: 'PUT',
      body: JSON.stringify({ open: isOpen }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Failed to update business availability';
      
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating business availability:', error);
    return rejectWithValue(error.message || 'Failed to update business availability');
  }
});

const businessAvailabilitySlice = createSlice({
  name: 'businessAvailability',
  initialState,
  reducers: {
    clearBusinessAvailabilityError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle getBusinessAvailability
      .addCase(getBusinessAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOpen = action.payload.open;
        state.businessId = action.payload.businessId;
        state.businessName = action.payload.businessName;
      })
      .addCase(getBusinessAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle updateBusinessAvailability
      .addCase(updateBusinessAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOpen = action.payload.open;
        state.businessId = action.payload.businessId;
        state.businessName = action.payload.businessName;
      })
      .addCase(updateBusinessAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearBusinessAvailabilityError } = businessAvailabilitySlice.actions;
export default businessAvailabilitySlice.reducer;
