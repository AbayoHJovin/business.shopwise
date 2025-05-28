import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, AuthState, logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ReduxAuthProviderProps {
  children: React.ReactNode;
}

/**
 * ReduxAuthProvider component that manages authentication state using Redux
 * This component replaces the context-based AuthProvider with a Redux-based implementation
 */
const ReduxAuthProvider: React.FC<ReduxAuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state: RootState) => state.auth as AuthState);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define public routes
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Helper function to check if current route is public
  const isPublicRoute = () => publicRoutes.includes(location.pathname);

  // Check authentication status on mount using the /api/auth/me endpoint
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Attempt to fetch the current user using the cookie
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error: any) {
        console.log('Not authenticated or session expired:', error);
        
        // If we get a 401 error, redirect to login page
        if (error === 'Unauthorized' || error === 'Invalid token' || error === 'No authentication token') {
          // Clear auth state
          dispatch(logout());
          
          // Don't redirect if already on login, signup, or public pages
          if (!isPublicRoute()) {
            navigate('/login', { replace: true });
          }
        }
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuthStatus();
  }, [dispatch, navigate, location.pathname]);

  // Monitor authentication state changes - this hook is always called
  useEffect(() => {
    // Only redirect if initial check is done and user is not authenticated
    if (initialCheckDone && !isAuthenticated && !isPublicRoute()) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, initialCheckDone, navigate, location.pathname]);
  
  // Show loading spinner or render children
  return initialCheckDone ? (
    <>{children}</>
  ) : (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading...</span>
    </div>
  );
};

export default ReduxAuthProvider;
