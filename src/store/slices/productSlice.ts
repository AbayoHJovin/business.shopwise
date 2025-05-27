import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';

// Define types for product data
export interface ProductImage {
  id: string;
  imageUrl: string;
  publicId: string;
  productId: string;
}

export interface ProductImageRequest {
  imageUrl: string;
  publicId: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  images?: ProductImageRequest[];
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

export interface PaginatedProductsResponse {
  products: Product[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  message?: string;
}

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
    isFetchingNextPage: boolean;
  };
}

// Initial state
const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalCount: 0,
    hasMore: false,
    isFetchingNextPage: false
  }
};

// Fetch products for the current business (legacy method)
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

// Fetch paginated products
export const fetchPaginatedProducts = createAsyncThunk<
  PaginatedProductsResponse,
  { page: number; size: number; resetList?: boolean },
  { state: RootState }
>(
  'products/fetchPaginated',
  async ({ page, size, resetList = false }, { rejectWithValue, getState }) => {
    try {
      const { business } = getState();
      
      if (!business.currentBusiness) {
        return rejectWithValue('No business selected. Please select a business first.');
      }
      
      // No need to add businessId as it's obtained from cookies in the backend
      const url = API_ENDPOINTS.PRODUCTS.GET_ALL(page, size);
      
      const response = await fetch(url, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      // Handle response
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch products';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return {
        ...data,
        resetList // Pass through the resetList flag to the reducer
      };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return rejectWithValue(error.message || 'Network error occurred while fetching products');
    }
  }
);

// Create a new product without images
export const createProduct = createAsyncThunk<Product, ProductRequest, { state: RootState }>(
  'products/create',
  async (productData, { rejectWithValue, getState }) => {
    try {
      const { business } = getState();
      
      if (!business.currentBusiness) {
        return rejectWithValue('No business selected. Please select a business first.');
      }
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS.CREATE, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: JSON.stringify(productData)
      });
      
      // Handle response
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to create product';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

// Create a new product with images
export const createProductWithImages = createAsyncThunk<
  Product, 
  { productData: ProductRequest, files: File[] }, 
  { state: RootState }
>(
  'products/createWithImages',
  async ({ productData, files }, { rejectWithValue, getState }) => {
    try {
      const { business } = getState();
      
      if (!business.currentBusiness) {
        return rejectWithValue('No business selected. Please select a business first.');
      }
      
      // Create form data for multipart/form-data request
      const formData = new FormData();
      
      // Add product data as JSON
      formData.append('product', new Blob([JSON.stringify(productData)], {
        type: 'application/json'
      }));
      
      // Add image files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS.CREATE_WITH_IMAGES, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      // Handle response
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to create product with images';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating product with images:', error);
      return rejectWithValue(error.message || 'Failed to create product with images');
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
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products (legacy method)
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
      
      // Fetch paginated products
      .addCase(fetchPaginatedProducts.pending, (state, action: PayloadAction<unknown, string, { arg: { page: number; size: number; resetList?: boolean } }>) => {
        // Only set isLoading to true on the first page load
        // For subsequent pages, we'll use pagination.isFetchingNextPage
        if (action.meta.arg.page === 0) {
          state.isLoading = true;
        } else {
          state.pagination.isFetchingNextPage = true;
        }
        state.error = null;
      })
      .addCase(fetchPaginatedProducts.fulfilled, (state, action: PayloadAction<PaginatedProductsResponse, string, { arg: { page: number; size: number; resetList?: boolean } }>) => {
        const { products, currentPage, pageSize, totalCount, hasMore } = action.payload;
        
        // If resetList is true or it's the first page, replace the items
        // Otherwise append the new items to the existing list
        if (action.meta.arg.resetList || currentPage === 0) {
          state.items = products;
        } else {
          // Append new products, avoiding duplicates by checking IDs
          const existingIds = new Set(state.items.map(item => item.id));
          const uniqueNewProducts = products.filter(product => !existingIds.has(product.id));
          state.items = [...state.items, ...uniqueNewProducts];
        }
        
        // Update pagination info
        state.pagination = {
          currentPage,
          pageSize,
          totalCount,
          hasMore,
          isFetchingNextPage: false
        };
        
        // Reset loading states
        state.isLoading = false;
      })
      .addCase(fetchPaginatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.pagination.isFetchingNextPage = false;
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
      
      // Create product with images
      .addCase(createProductWithImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductWithImages.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.items.unshift(action.payload); // Add to the beginning of the array
      })
      .addCase(createProductWithImages.rejected, (state, action) => {
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

export const { clearProductsError, resetPagination } = productSlice.actions;
export default productSlice.reducer;
