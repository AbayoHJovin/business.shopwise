import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Define auth state interface to avoid circular imports
interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define types for business data
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: Location;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  businessHours: BusinessHours[];
  images: string[];
  ownerId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessState {
  businesses: Business[];
  userBusinesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: BusinessState = {
  businesses: [],
  userBusinesses: [],
  currentBusiness: null,
  isLoading: false,
  error: null,
};

// Async thunks for business operations
export const fetchAllBusinesses = createAsyncThunk(
  'business/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/businesses');
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch businesses');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchUserBusinesses = createAsyncThunk<Business[], void, { state: RootState }>(
  'business/fetchUserBusinesses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch('/api/businesses/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user businesses');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchBusinessById = createAsyncThunk(
  'business/fetchById',
  async (businessId: string, { rejectWithValue }) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/businesses/${businessId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch business');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createBusiness = createAsyncThunk<Business, Partial<Business>, { state: RootState }>(
  'business/create',
  async (businessData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(businessData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create business');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateBusiness = createAsyncThunk<Business, { businessId: string; businessData: Partial<Business> }, { state: RootState }>(
  'business/update',
  async ({ 
    businessId, 
    businessData 
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(businessData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update business');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteBusiness = createAsyncThunk<string, string, { state: RootState }>(
  'business/delete',
  async (businessId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const auth = state.auth as AuthState;
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Replace with your actual API endpoint
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to delete business');
      }

      return businessId;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create the business slice
const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearBusinessError: (state) => {
      state.error = null;
    },
    clearCurrentBusiness: (state) => {
      state.currentBusiness = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all businesses
    builder
      .addCase(fetchAllBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBusinesses.fulfilled, (state, action: PayloadAction<Business[]>) => {
        state.isLoading = false;
        state.businesses = action.payload;
        state.error = null;
      })
      .addCase(fetchAllBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user businesses
    builder
      .addCase(fetchUserBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBusinesses.fulfilled, (state, action: PayloadAction<Business[]>) => {
        state.isLoading = false;
        state.userBusinesses = action.payload;
        state.error = null;
      })
      .addCase(fetchUserBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch business by ID
    builder
      .addCase(fetchBusinessById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessById.fulfilled, (state, action: PayloadAction<Business>) => {
        state.isLoading = false;
        state.currentBusiness = action.payload;
        state.error = null;
      })
      .addCase(fetchBusinessById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create business
    builder
      .addCase(createBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBusiness.fulfilled, (state, action: PayloadAction<Business>) => {
        state.isLoading = false;
        state.userBusinesses.push(action.payload);
        state.currentBusiness = action.payload;
        state.error = null;
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update business
    builder
      .addCase(updateBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusiness.fulfilled, (state, action: PayloadAction<Business>) => {
        state.isLoading = false;
        state.currentBusiness = action.payload;
        
        // Update in businesses array
        const index = state.businesses.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.businesses[index] = action.payload;
        }
        
        // Update in userBusinesses array
        const userIndex = state.userBusinesses.findIndex(b => b.id === action.payload.id);
        if (userIndex !== -1) {
          state.userBusinesses[userIndex] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete business
    builder
      .addCase(deleteBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBusiness.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.businesses = state.businesses.filter(b => b.id !== action.payload);
        state.userBusinesses = state.userBusinesses.filter(b => b.id !== action.payload);
        if (state.currentBusiness && state.currentBusiness.id === action.payload) {
          state.currentBusiness = null;
        }
        state.error = null;
      })
      .addCase(deleteBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusinessError, clearCurrentBusiness } = businessSlice.actions;
export default businessSlice.reducer;
