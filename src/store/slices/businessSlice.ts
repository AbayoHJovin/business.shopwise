import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define auth state interface to avoid circular imports
interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define types for business data based on the backend DTOs
export interface LocationDto {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  formattedLocation?: string;
}

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface BusinessDto {
  id: string;
  name: string;
  location: LocationDto;
  about?: string;
  websiteLink?: string;
  collaboratorIds?: string[];
  productCount?: number;
  employeeCount?: number;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: LocationDto;
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
  userBusinesses: BusinessDto[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
}

// Helper function to convert BusinessDto to Business
const convertBusinessDtoToBusiness = (dto: BusinessDto): Business => {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.about || '',
    category: '', // Default value, update if you have this information
    location: dto.location,
    contactPhone: '', // Default value, update if you have this information
    contactEmail: '', // Default value, update if you have this information
    website: dto.websiteLink,
    businessHours: [], // Default value, update if you have this information
    images: [], // Default value, update if you have this information
    ownerId: '', // Default value, update if you have this information
    isVerified: false, // Default value, update if you have this information
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

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

// Fetch user businesses using the /api/business/getMine endpoint
export const fetchMyBusinesses = createAsyncThunk<BusinessDto[], void, { state: RootState }>(
  'business/fetchMyBusinesses',
  async (_, { rejectWithValue }) => {
    try {
      // Use the getMine endpoint with credentials included
      const response = await fetch(API_ENDPOINTS.BUSINESS.GET_MINE, {
        method: 'GET',
        ...DEFAULT_REQUEST_OPTIONS,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to fetch user businesses';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching user businesses:', error);
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Legacy function for backward compatibility
export const fetchUserBusinesses = createAsyncThunk<Business[], void, { state: RootState }>(
  'business/fetchUserBusinesses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Use the new fetchMyBusinesses function instead
      const resultAction = await dispatch(fetchMyBusinesses());
      
      if (fetchMyBusinesses.fulfilled.match(resultAction)) {
        return resultAction.payload as unknown as Business[];
      }
      
      return rejectWithValue('Failed to fetch user businesses');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
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

// Define the CreateBusinessRequest type based on the backend DTO
export interface CreateBusinessRequest {
  name: string;
  location: LocationDto;
  about?: string;
  websiteLink?: string;
}

export const createBusiness = createAsyncThunk<BusinessDto, CreateBusinessRequest, { state: RootState }>(
  'business/create',
  async (businessData, { rejectWithValue, dispatch }) => {
    try {
      // Use the API_ENDPOINTS.BUSINESS.CREATE endpoint with credentials included
      const response = await fetch(API_ENDPOINTS.BUSINESS.CREATE, {
        method: 'POST',
        ...DEFAULT_REQUEST_OPTIONS,
        body: JSON.stringify(businessData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to create business';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }

      // After successful creation, refresh the user's businesses list
      dispatch(fetchMyBusinesses());
      
      return data;
    } catch (error: any) {
      console.error('Error creating business:', error);
      return rejectWithValue(error.message || 'Network error occurred');
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
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Not authenticated');
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

// Select business thunk
export const selectBusiness = createAsyncThunk<{ message: string }, string, { state: RootState }>(
  'business/select',
  async (businessId, { rejectWithValue }) => {
    try {
      // Use the API_ENDPOINTS.BUSINESS.SELECT endpoint with credentials included
      const response = await fetch(API_ENDPOINTS.BUSINESS.SELECT(businessId), {
        method: 'POST',
        ...DEFAULT_REQUEST_OPTIONS,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to select business';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error selecting business:', error);
      return rejectWithValue(error.message || 'Network error occurred');
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

    // Fetch my businesses using the /api/business/getMine endpoint
    builder
      .addCase(fetchMyBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBusinesses = action.payload;
      })
      .addCase(fetchMyBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

    // Legacy fetch user businesses
    builder
      .addCase(fetchUserBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBusinesses = action.payload;
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
      .addCase(createBusiness.fulfilled, (state, action: PayloadAction<BusinessDto>) => {
        state.isLoading = false;
        state.userBusinesses.push(action.payload);
        // Convert the DTO to a Business object for currentBusiness
        state.currentBusiness = convertBusinessDtoToBusiness(action.payload);
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
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted business from the userBusinesses array
        state.userBusinesses = state.userBusinesses.filter(business => business.id !== action.payload);
        if (state.currentBusiness && state.currentBusiness.id === action.payload) {
          state.currentBusiness = null;
        }
        state.error = null;
      })
      .addCase(deleteBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Select business
    builder
      .addCase(selectBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(selectBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        // We don't need to update any state here as the backend sets a cookie
        // The currentBusiness will be set when we navigate to the dashboard and fetch the selected business
        state.error = null;
      })
      .addCase(selectBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusinessError, clearCurrentBusiness } = businessSlice.actions;
export default businessSlice.reducer;
