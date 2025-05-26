import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for sale data
export interface SaleRecordRequest {
  productId: string;
  packetsSold?: number;
  piecesSold?: number;
  saleTime?: string;
  manuallyAdjusted?: boolean;
  loggedLater?: boolean;
  notes?: string;
  actualSaleTime?: string;
}

export interface SaleRecord {
  id: string;
  packetsSold: number;
  piecesSold: number;
  totalPiecesSold: number;
  saleTime: string;
  manuallyAdjusted: boolean;
  loggedLater: boolean;
  notes: string;
  actualSaleTime: string;
  productId: string;
  productName: string;
  pricePerItem: number;
  totalSaleValue: number;
  businessId: string;
  businessName: string;
}

interface SalesState {
  items: SaleRecord[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string; // ISO date string for filtering
  totalAmount: number; // Total amount of sales for the selected date
}

// Format today's date as ISO string (YYYY-MM-DD)
const today = new Date();
const formattedToday = today.toISOString().split('T')[0];

// Initial state
const initialState: SalesState = {
  items: [],
  isLoading: false,
  error: null,
  selectedDate: formattedToday,
  totalAmount: 0
};

// Response interface for the API
interface SalesApiResponse {
  sales: SaleRecord[];
  totalAmount: number;
}

// Log a new sale
export const logSale = createAsyncThunk<SaleRecord, SaleRecordRequest, { state: RootState }>(
  'sales/logSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SALES.LOG_SALE}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify(saleData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to log sale';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error logging sale:', error);
      return rejectWithValue(error.message || 'Failed to log sale');
    }
  }
);

// Fetch sales for the current business and selected date
export const fetchSalesByDate = createAsyncThunk<SalesApiResponse, string, { state: RootState }>(
  'sales/fetchByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SALES.GET_BY_DATE}?date=${date}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch sales';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      return rejectWithValue(error.message || 'Failed to fetch sales');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    clearSalesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchSalesByDate
      .addCase(fetchSalesByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.sales;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchSalesByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle logSale
      .addCase(logSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logSale.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally add the new sale to the items array if it matches the current date
        const saleDate = new Date(action.payload.saleTime).toISOString().split('T')[0];
        if (saleDate === state.selectedDate) {
          state.items = [...state.items, action.payload];
          state.totalAmount += action.payload.totalSaleValue;
        }
      })
      .addCase(logSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedDate, clearSalesError } = salesSlice.actions;
export default salesSlice.reducer;
