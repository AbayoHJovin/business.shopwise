import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for our state
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other user properties as needed
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Async thunks for authentication
interface UserLoginRequest {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: UserLoginRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        ...DEFAULT_REQUEST_OPTIONS,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the backend
        let errorMessage = 'Login failed';
        
        // Extract error message from various possible response formats
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      // Since we're using HTTP-only cookies, we don't need to store the token
      // The cookie will be automatically sent with subsequent requests
      
      // We need to fetch the current user details using the /api/auth/me endpoint
      try {
        const meResponse = await fetch(API_ENDPOINTS.AUTH.ME, {
          method: 'GET',
          ...DEFAULT_REQUEST_OPTIONS,
        });
        
        if (meResponse.ok) {
          const userProfile = await meResponse.json();
          return { message: data.message, user: userProfile };
        }
      } catch (profileError) {
        console.warn('Error fetching user profile after login:', profileError);
        // Continue with login success even if profile fetch fails
      }
      
      // Return the login success response
      return { message: data.message, user: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Define the user registration request type
interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async (userData: UserRegisterRequest, { rejectWithValue }) => {
    try {
      // Connect to the actual backend API endpoint
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        ...DEFAULT_REQUEST_OPTIONS,
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the backend
        let errorMessage = 'Registration failed';
        
        // Extract error message from various possible response formats
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.errors && Array.isArray(data.errors)) {
          // Handle validation errors array if present
          errorMessage = data.errors.join(', ');
        }
        
        return rejectWithValue(errorMessage);
      }

      // For now, we might not have a token immediately after registration
      // depending on your backend implementation
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      try {
          // Call the backend to invalidate the token
          await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
            ...DEFAULT_REQUEST_OPTIONS,
          });
        } catch (error) {
          console.warn('Error calling logout API:', error);
          // Continue with local logout even if API call fails
        }
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

// Fetch current user from the backend using /api/auth/me endpoint
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: 'GET',
        ...DEFAULT_REQUEST_OPTIONS,
      });

      // Handle 401 Unauthorized immediately
      if (response.status === 401) {
        // Clear token from localStorage as it's invalid
        localStorage.removeItem('token');
        return rejectWithValue('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the backend
        let errorMessage = 'Authentication failed';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Additional reducers if needed
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // We're using HTTP-only cookies now, so we don't need to store the token
        state.token = null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // If the backend returns a token and user on registration, set them
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user profile cases
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        // Important: Set isAuthenticated to true when we have valid user data
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        // If token is invalid or unauthorized, clear auth state
        if (
          action.payload === 'No authentication token' || 
          action.payload === 'Invalid token' || 
          action.payload === 'Unauthorized'
        ) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          // Remove token from localStorage
          localStorage.removeItem('token');
        }
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
