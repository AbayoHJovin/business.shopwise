import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_BASE_URL, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for product data
export interface ProductImage {
  id: string;
  imageUrl: string;
  publicId: string;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  businessId: string;
  dateAdded?: string;
  
  // Calculated fields
  totalItems: number;
  totalValue: number;
  
  // Product images (max 3)
  images: ProductImage[];
}

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Fetch products for the current business
export const fetchProducts = createAsyncThunk<Product[], void, { state: RootState }>(
  'products/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { business } = getState();
      
      if (!business.currentBusiness) {
        return rejectWithValue('No business selected. Please select a business first.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products/business/${business.currentBusiness.id}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch products');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

// Create a new product
export const createProduct = createAsyncThunk<Product, Partial<Product>, { state: RootState }>(
  'products/create',
  async (productData, { rejectWithValue, getState }) => {
    try {
      const { business } = getState();
      
      if (!business.currentBusiness) {
        return rejectWithValue('No business selected. Please select a business first.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify({
          ...productData,
          businessId: business.currentBusiness.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create product');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

// Update an existing product
export const updateProduct = createAsyncThunk<Product, Partial<Product>, { state: RootState }>(
  'products/update',
  async (productData, { rejectWithValue }) => {
    try {
      if (!productData.id) {
        return rejectWithValue('Product ID is required for update');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products/${productData.id}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update product');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk<string, string, { state: RootState }>(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete product');
      }
      
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductsError } = productSlice.actions;
export default productSlice.reducer;
