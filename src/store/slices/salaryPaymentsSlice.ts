import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define the SalaryPayment interface
export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  amount: number;
  paymentDate: string;
  businessId: string;
  businessName: string;
}

// Define the CreateSalaryPaymentRequest interface
export interface CreateSalaryPaymentRequest {
  employeeId: string;
  amount: number;
  paymentDate: string;
}

// Define the state interface
interface SalaryPaymentsState {
  payments: SalaryPayment[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  createError: string | null;
  createSuccess: boolean;
  deleteError: string | null;
  deleteSuccess: boolean;
}

// Initial state
const initialState: SalaryPaymentsState = {
  payments: [],
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  error: null,
  createError: null,
  createSuccess: false,
  deleteError: null,
  deleteSuccess: false,
};

// Async thunk to fetch salary payments by employee ID
export const fetchSalaryPaymentsByEmployeeId = createAsyncThunk(
  'salaryPayments/fetchByEmployeeId',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.SALARY_PAYMENTS.GET_BY_EMPLOYEE(employeeId), {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch salary payments');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching salary payments');
    }
  }
);

// Async thunk to create a new salary payment
export const createSalaryPayment = createAsyncThunk(
  'salaryPayments/create',
  async (paymentData: CreateSalaryPaymentRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.SALARY_PAYMENTS.CREATE, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create salary payment');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating the salary payment');
    }
  }
);

// Async thunk to delete a salary payment
export const deleteSalaryPayment = createAsyncThunk(
  'salaryPayments/delete',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.SALARY_PAYMENTS.DELETE(paymentId), {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete salary payment');
      }

      return paymentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting the salary payment');
    }
  }
);

// Create the slice
const salaryPaymentsSlice = createSlice({
  name: 'salaryPayments',
  initialState,
  reducers: {
    clearSalaryPayments: (state) => {
      state.payments = [];
      state.error = null;
    },
    resetCreateState: (state) => {
      state.isCreating = false;
      state.createError = null;
      state.createSuccess = false;
    },
    resetDeleteState: (state) => {
      state.isDeleting = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch salary payments cases
      .addCase(fetchSalaryPaymentsByEmployeeId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalaryPaymentsByEmployeeId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
        state.error = null;
      })
      .addCase(fetchSalaryPaymentsByEmployeeId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create salary payment cases
      .addCase(createSalaryPayment.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createSalaryPayment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.payments = [action.payload, ...state.payments];
        state.createSuccess = true;
        state.createError = null;
      })
      .addCase(createSalaryPayment.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
        state.createSuccess = false;
      })
      
      // Delete salary payment cases
      .addCase(deleteSalaryPayment.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteSalaryPayment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.payments = state.payments.filter(payment => payment.id !== action.payload);
        state.deleteSuccess = true;
        state.deleteError = null;
      })
      .addCase(deleteSalaryPayment.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
        state.deleteSuccess = false;
      });
  },
});

export const { clearSalaryPayments, resetCreateState, resetDeleteState } = salaryPaymentsSlice.actions;
export default salaryPaymentsSlice.reducer;
