import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, logout, register, fetchUserProfile, AuthState } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

/**
 * Custom hook for accessing authentication state and methods using Redux
 * This replaces the context-based useAuth hook with a Redux-based implementation
 */
export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, token } = useAppSelector((state: RootState) => state.auth as AuthState);

  // Login handler
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else if (login.rejected.match(resultAction)) {
        // Return the error message from the payload
        return { success: false, error: resultAction.payload as string };
      }
      return { success: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'An unexpected error occurred' };
    }
  }, [dispatch]);

  // Register handler
  const handleRegister = useCallback(async (userData: any) => {
    try {
      const resultAction = await dispatch(register(userData));
      if (register.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else if (register.rejected.match(resultAction)) {
        // Return the error message from the payload
        return { success: false, error: resultAction.payload as string };
      }
      return { success: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'An unexpected error occurred' };
    }
  }, [dispatch]);

  // Logout handler
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  // Refresh user profile
  const refreshUserProfile = useCallback(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    refreshUserProfile
  };
};
