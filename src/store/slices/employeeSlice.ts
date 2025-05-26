import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for employee data
export enum Role {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SALES_ASSOCIATE = 'SALES_ASSOCIATE',
  INVENTORY_CLERK = 'INVENTORY_CLERK'
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
  joinedDate: string;
  isDisabled: boolean;
  isCollaborator: boolean;
  emailConfirmed: boolean;
  role: Role;
  businessId: string;
  businessName: string;
}

interface EmployeesState {
  items: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: EmployeesState = {
  items: [],
  selectedEmployee: null,
  isLoading: false,
  error: null
};

// Fetch employees for the current business
export const fetchEmployees = createAsyncThunk<Employee[], void, { state: RootState }>(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/get-by-business`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch employees';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      return rejectWithValue(error.message || 'Failed to fetch employees');
    }
  }
);

// Fetch a single employee by ID
export const fetchEmployeeById = createAsyncThunk<Employee, string, { state: RootState }>(
  'employees/fetchById',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch employee details';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching employee details:', error);
      return rejectWithValue(error.message || 'Failed to fetch employee details');
    }
  }
);

// Create employee request interface
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  salary: number;
  isCollaborator: boolean;
}

// Create a new employee
export const addEmployee = createAsyncThunk<Employee, CreateEmployeeRequest, { state: RootState }>(
  'employees/add',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.EMPLOYEES.ADD, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to add employee';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error adding employee:', error);
      return rejectWithValue(error.message || 'Failed to add employee');
    }
  }
);

// Delete an employee
export const deleteEmployee = createAsyncThunk<string, string, { state: RootState }>(
  'employees/delete',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        let errorMessage = 'Failed to delete employee';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return employeeId;
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      return rejectWithValue(error.message || 'Failed to delete employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.isLoading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add employee
      .addCase(addEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.items = state.items.filter(employee => employee.id !== action.payload);
        if (state.selectedEmployee && state.selectedEmployee.id === action.payload) {
          state.selectedEmployee = null;
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmployeeError, clearSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
