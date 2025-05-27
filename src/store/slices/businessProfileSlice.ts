import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for business profile
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

export interface BusinessProfileState {
  id: string | null;
  name: string | null;
  location: LocationDto | null;
  about: string | null;
  websiteLink: string | null;
  collaboratorIds: string[] | null;
  productCount: number | null;
  employeeCount: number | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: BusinessProfileState = {
  id: null,
  name: null,
  location: null,
  about: null,
  websiteLink: null,
  collaboratorIds: null,
  productCount: null,
  employeeCount: null,
  isLoading: false,
  error: null
};

// Get business profile
export const getBusinessProfile = createAsyncThunk<
  BusinessProfileState,
  void,
  { state: RootState }
>('businessProfile/get', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.BUSINESS.GET_BY_ID, {
      ...DEFAULT_REQUEST_OPTIONS,
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Failed to get business profile';
      
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error getting business profile:', error);
    return rejectWithValue(error.message || 'Failed to get business profile');
  }
});

// Update business profile
const updateBusiness = createAsyncThunk<
  BusinessProfileState,
  {
    name: string;
    location: LocationDto;
    about: string;
    websiteLink: string;
  },
  { state: RootState }
>('businessProfile/update', async (updateData, { rejectWithValue, getState }) => {
  try {
    const state = await getState();
    const response = await fetch(API_ENDPOINTS.BUSINESS.UPDATE(state.businessProfile.id!), {
      ...DEFAULT_REQUEST_OPTIONS,
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Failed to update business profile';
      
      if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating business profile:', error);
    return rejectWithValue(error.message || 'Failed to update business profile');
  }
});

const businessProfileSlice = createSlice({
  name: 'businessProfile',
  initialState,
  reducers: {
    clearBusinessProfileError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle getBusinessProfile
      .addCase(getBusinessProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.location = action.payload.location;
        state.about = action.payload.about;
        state.websiteLink = action.payload.websiteLink;
        state.collaboratorIds = action.payload.collaboratorIds;
        state.productCount = action.payload.productCount;
        state.employeeCount = action.payload.employeeCount;
      })
      .addCase(getBusinessProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle updateBusiness
      .addCase(updateBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.location = action.payload.location;
        state.about = action.payload.about;
        state.websiteLink = action.payload.websiteLink;
        state.collaboratorIds = action.payload.collaboratorIds;
        state.productCount = action.payload.productCount;
        state.employeeCount = action.payload.employeeCount;
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusinessProfileError } = businessProfileSlice.actions;
export { updateBusiness };
export default businessProfileSlice.reducer;
