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
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
  },
  // Business endpoints
  BUSINESS: {
    LIST: `${API_BASE_URL}/api/businesses`,
    USER_BUSINESSES: `${API_BASE_URL}/api/businesses/user`,
    GET_MINE: `${API_BASE_URL}/api/business/getMine`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/businesses/${id}`,
    CREATE: `${API_BASE_URL}/api/businesses`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/businesses/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/businesses/${id}`,
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
