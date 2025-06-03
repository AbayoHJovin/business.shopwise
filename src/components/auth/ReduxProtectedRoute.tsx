import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import type { AuthState } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redux-based protected route component
 * Redirects to login if user is not authenticated
 */
const ReduxProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, error } = useAppSelector((state: RootState) => state.auth as AuthState);
  const location = useLocation();
  const [verifyingAuth, setVerifyingAuth] = useState(true);
  
  // Verify authentication status on every route access
  useEffect(() => {
    const verifyAuthentication = async () => {
      setVerifyingAuth(true);
      try {
        // Call the /me endpoint to verify the user's authentication status
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error) {
        console.log('Authentication verification failed:', error);
        // Error handling is done in the Redux slice
      } finally {
        setVerifyingAuth(false);
      }
    };
    
    verifyAuthentication();
  }, [dispatch, location.pathname]); // Re-verify when the route changes

  // If still loading or verifying, show a loading spinner
  if (isLoading || verifyingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location the user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ReduxProtectedRoute;
