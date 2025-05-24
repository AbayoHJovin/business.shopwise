import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for dashboard data based on the backend DTOs
export interface MonthlySalesDto {
  month: string;
  salesCount: number;
  revenue: number;
  isHighest: boolean;
}

interface ProductImageResponse {
  id: string;
  imageUrl: string;
  publicId: string;
  productId: string;
}

interface ProductResponse {
  id: string;
  name: string;
  description: string;
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  businessId: string;
  
  // Calculated fields
  totalItems: number;
  totalValue: number;
  
  // Product images (max 3)
  images: ProductImageResponse[];
}

interface ExpenseResponse {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  createdAt: string;
  businessId: string;
  businessName: string;
}

export interface BusinessDashboardDto {
  businessId: string;
  businessName: string;
  
  // Revenue data
  totalRevenue: number;
  previousMonthRevenue: number;
  revenueChangePercentage: number;
  
  // Product data
  totalProducts: number;
  
  // Employee/Collaborator data
  totalEmployees: number;
  totalCollaborators: number;
  
  // Expense data
  totalExpenses: number;
  previousMonthExpenses: number;
  expenseChangePercentage: number;
  
  // Stock investment
  totalStockInvestment: number;
  
  // Monthly sales data for chart
  monthlySales: MonthlySalesDto[];
  highestSalesMonth: string;
  
  // Top selling products
  topSellingProducts: ProductResponse[];
  
  // Latest expenses
  latestExpenses: ExpenseResponse[];
}

interface DashboardState {
  data: BusinessDashboardDto | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
};

// Fetch dashboard data
export const fetchDashboardData = createAsyncThunk<BusinessDashboardDto, void, { state: RootState }>(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD.GET, {
        method: 'GET',
        ...DEFAULT_REQUEST_OPTIONS,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to fetch dashboard data';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Create the dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.data = null;
      state.error = null;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardData, clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
