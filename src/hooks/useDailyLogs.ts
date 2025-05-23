import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchDailyLogs, 
  fetchLogsByDate, 
  fetchLogsByDateRange,
  setSelectedDate,
  setDateRange,
  addMockLogs
} from '@/store/slices/dailyLogsSlice';
import { DailyLog } from '@/types/DailyLog';

// For demo purposes - generate mock logs
const generateMockLogs = (date: string = new Date().toISOString().split('T')[0]): DailyLog[] => {
  const activities = [
    'Created a new product',
    'Updated inventory',
    'Added a new employee',
    'Processed a sale',
    'Updated business information',
    'Generated sales report',
    'Added expense record',
    'Updated product pricing',
    'Scheduled employee shift',
    'Exported data'
  ];
  
  const categories = [
    'product', 'inventory', 'employee', 'sales', 'business', 
    'report', 'expense', 'pricing', 'schedule', 'export'
  ];
  
  // Generate 5-10 random logs for the given date
  const count = Math.floor(Math.random() * 6) + 5;
  const logs: DailyLog[] = [];
  
  for (let i = 0; i < count; i++) {
    const activityIndex = Math.floor(Math.random() * activities.length);
    const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    
    logs.push({
      id: `log-${date}-${i}`,
      description: activities[activityIndex],
      timestamp: `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
      category: categories[activityIndex],
      userId: 'current-user',
      businessId: 'current-business'
    });
  }
  
  // Sort by timestamp
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const useDailyLogs = () => {
  const dispatch = useAppDispatch();
  const { 
    logs, 
    filteredLogs, 
    selectedDate, 
    dateRange,
    isLoading, 
    error 
  } = useAppSelector(state => state.dailyLogs);
  
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Load logs on initial render if authenticated
  useEffect(() => {
    if (isAuthenticated && logs.length === 0) {
      // For demo purposes, add mock logs instead of fetching from API
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      
      const mockLogs = [
        ...generateMockLogs(today),
        ...generateMockLogs(yesterday),
        ...generateMockLogs(twoDaysAgo)
      ];
      
      dispatch(addMockLogs(mockLogs));
      
      // In a real app, you would fetch logs from the API
      // dispatch(fetchDailyLogs());
    }
  }, [dispatch, isAuthenticated, logs.length]);

  // Filter logs by date
  const filterByDate = (date: string) => {
    dispatch(setSelectedDate(date));
    
    // In a real app, you might want to fetch logs for this specific date
    // dispatch(fetchLogsByDate(date));
  };

  // Filter logs by date range
  const filterByDateRange = (from: string, to: string) => {
    dispatch(setDateRange({ from, to }));
    
    // In a real app, you would fetch logs for this date range
    // dispatch(fetchLogsByDateRange({ from, to }));
  };

  return {
    logs,
    filteredLogs,
    selectedDate,
    dateRange,
    isLoading,
    error,
    filterByDate,
    filterByDateRange
  };
};
