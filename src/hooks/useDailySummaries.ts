import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDailySummariesByDate } from '@/store/slices/dailySummariesSlice';
import { format } from 'date-fns';

export const useDailySummaries = () => {
  const dispatch = useAppDispatch();
  const { 
    summaries, 
    isLoading, 
    error 
  } = useAppSelector(state => state.dailySummaries);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Load summaries for the current date on initial render
  useEffect(() => {
    fetchSummariesByDate(selectedDate);
  }, []);

  // Filter summaries by date
  const fetchSummariesByDate = (date: string) => {
    setSelectedDate(date);
    dispatch(fetchDailySummariesByDate(date));
  };

  // Filter summaries by search query (client-side filtering)
  const filteredSummaries = searchQuery.trim() === '' 
    ? summaries 
    : summaries.filter(summary => 
        summary.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return {
    summaries,
    filteredSummaries,
    selectedDate,
    isLoading,
    error,
    fetchSummariesByDate,
    searchQuery,
    setSearchQuery
  };
};
