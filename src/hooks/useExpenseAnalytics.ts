import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchExpenseAnalytics, clearExpenseAnalytics } from '@/store/slices/expenseAnalyticsSlice';

export const useExpenseAnalytics = () => {
  const dispatch = useAppDispatch();
  const { 
    data, 
    isLoading, 
    error 
  } = useAppSelector(state => state.expenseAnalytics);
  
  // Track if the modal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch the expense analytics
  const fetchAnalytics = async () => {
    try {
      await dispatch(fetchExpenseAnalytics()).unwrap();
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch expense analytics:', error);
    }
  };

  // Function to close the modal and clear the analytics
  const closeModal = () => {
    setIsModalOpen(false);
    dispatch(clearExpenseAnalytics());
  };

  return {
    analytics: data,
    isLoading,
    error,
    isModalOpen,
    fetchAnalytics,
    closeModal
  };
};
