import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, AuthState } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { Loader2 } from 'lucide-react';

interface ReduxAuthProviderProps {
  children: React.ReactNode;
}

/**
 * ReduxAuthProvider component that manages authentication state using Redux
 * This component replaces the context-based AuthProvider with a Redux-based implementation
 */
const ReduxAuthProvider: React.FC<ReduxAuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state: RootState) => state.auth as AuthState);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check authentication status on mount using the /api/auth/me endpoint
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Attempt to fetch the current user using the cookie
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error) {
        console.log('Not authenticated or session expired');
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // Show a loading spinner while checking authentication status
  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default ReduxAuthProvider;
