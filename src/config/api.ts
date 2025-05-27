/**
 * API configuration for the application
 * This file contains the base URL and other API-related settings
 */

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:5000'; // Backend running on port 5000

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    CURRENT_USER: `${API_BASE_URL}/api/auth/me`,
    ME: `${API_BASE_URL}/api/auth/me`, // Add ME property to match usage in authSlice.ts
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  },
  // Password management endpoints
  PASSWORD: {
    FORGOT: `${API_BASE_URL}/api/password/forgot`,
    RESET: `${API_BASE_URL}/api/password/reset`,
  },
  // Business endpoints
  BUSINESS: {
    LIST: `${API_BASE_URL}/api/business`,
    USER_BUSINESSES: `${API_BASE_URL}/api/business/user`,
    GET_MINE: `${API_BASE_URL}/api/business/getMine`,
    GET_SELECTED: `${API_BASE_URL}/api/business/selected`,
    GET_BY_ID: `${API_BASE_URL}/api/business/get-by-id`,
    CREATE: `${API_BASE_URL}/api/business/create`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/business/${id}`,
    UPDATE: `${API_BASE_URL}/api/business/update`,
    DELETE: `${API_BASE_URL}/api/business/delete`,
    SELECT: (id: string) => `${API_BASE_URL}/api/business/select/${id}`,
    AVAILABILITY: {
      GET: `${API_BASE_URL}/api/business/availability`,
      UPDATE: `${API_BASE_URL}/api/business/availability`,
    },
  },
  // Products endpoints
  PRODUCTS: {
    GET_ALL: (page: number, size: number) => `${API_BASE_URL}/api/products/getAll?page=${page}&size=${size}`,
    SEARCH: (keyword: string) => `${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`,
    GET_BY_BUSINESS: (businessId: string) => `${API_BASE_URL}/api/products/business/${businessId}`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    CREATE: `${API_BASE_URL}/api/products`,
    CREATE_WITH_IMAGES: `${API_BASE_URL}/api/products/with-images`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  },
  // Employees endpoints
  EMPLOYEES: {
    GET_ALL: `${API_BASE_URL}/api/employees/get-by-business`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/employees/${id}`,
    CREATE: `${API_BASE_URL}/api/employees`,
    ADD: `${API_BASE_URL}/api/employees/add`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/employees/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/employees/${id}`,
  },
  // Dashboard endpoints
  DASHBOARD: {
    GET: `${API_BASE_URL}/api/dashboard`,
  },
  // Expenses endpoints
  EXPENSES: {
    GET_BY_DATE: `${API_BASE_URL}/api/expenses`,
    CREATE: `${API_BASE_URL}/api/expenses`,
    CREATE_EXPENSE: `${API_BASE_URL}/api/expenses/create`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/expenses/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/expenses/${id}`,
  },
  // Sales endpoints
  SALES: {
    GET_BY_DATE: (date: string) => `${API_BASE_URL}/api/sales/date?date=${date}`,
    LOG_SALE: `${API_BASE_URL}/api/sales/log`,
    CREATE: `${API_BASE_URL}/api/sales`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/sales/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/sales/${id}`,
  },
  // Daily summaries endpoints
  DAILY_SUMMARIES: {
    GET_BY_DATE: (date: string) => `${API_BASE_URL}/api/daily-summaries/date?date=${date}`,
  },
};

// Default request options with credentials included
export const DEFAULT_REQUEST_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials,
};

// No need for auth headers as we're using cookies with credentials: 'include'
// This function is kept for backward compatibility but just returns the default options
export const getAuthHeaders = () => DEFAULT_REQUEST_OPTIONS;
