import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserBusinesses, 
  fetchBusinessById,
  Business
} from '@/store/slices/businessSlice';

export const useBusinesses = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { 
    userBusinesses, 
    currentBusiness, 
    isLoading, 
    error 
  } = useAppSelector(state => state.business);
  
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserBusinesses());
    }
  }, [dispatch, isAuthenticated]);

  const selectBusiness = async (businessId: string) => {
    try {
      // Store the selected business ID in localStorage for persistence
      localStorage.setItem('selectedBusinessId', businessId);
      
      // Fetch the business details to set as current business
      await dispatch(fetchBusinessById(businessId)).unwrap();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting business:', error);
    }
  };

  return {
    userBusinesses,
    currentBusiness,
    isLoading,
    error,
    selectBusiness
  };
};
