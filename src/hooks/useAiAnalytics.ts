import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAiDailySummary, clearAiSummary } from '@/store/slices/aiAnalyticsSlice';

export const useAiAnalytics = () => {
  const dispatch = useAppDispatch();
  const { 
    dailySummary, 
    isLoading, 
    error 
  } = useAppSelector(state => state.aiAnalytics);
  
  // Track if the modal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch the AI daily summary
  const fetchDailySummary = async () => {
    try {
      await dispatch(fetchAiDailySummary()).unwrap();
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch AI summary:', error);
    }
  };

  // Function to close the modal and clear the summary
  const closeModal = () => {
    setIsModalOpen(false);
    dispatch(clearAiSummary());
  };

  return {
    dailySummary,
    isLoading,
    error,
    isModalOpen,
    fetchDailySummary,
    closeModal
  };
};
