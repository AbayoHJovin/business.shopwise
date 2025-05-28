import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import businessReducer from '@/store/slices/businessSlice';
import dailyLogsReducer from '@/store/slices/dailyLogsSlice';
import dashboardReducer from '@/store/slices/dashboardSlice';
import productReducer from '@/store/slices/productSlice';
import employeeReducer from '@/store/slices/employeeSlice';
import expenseReducer from '@/store/slices/expenseSlice';
import salesReducer from '@/store/slices/salesSlice';
import dailySummariesReducer from '@/store/slices/dailySummariesSlice';
import businessAvailabilityReducer from '@/store/slices/businessAvailabilitySlice';
import businessProfileReducer from '@/store/slices/businessProfileSlice';
import aiChatReducer from '@/store/slices/aiChatSlice';
import aiAnalyticsReducer from '@/store/slices/aiAnalyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    dailyLogs: dailyLogsReducer,
    dashboard: dashboardReducer,
    products: productReducer,
    employees: employeeReducer,
    expenses: expenseReducer,
    sales: salesReducer,
    dailySummaries: dailySummariesReducer,
    businessAvailability: businessAvailabilityReducer,
    businessProfile: businessProfileReducer,
    aiChat: aiChatReducer,
    aiAnalytics: aiAnalyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
