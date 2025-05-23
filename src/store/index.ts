import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import businessReducer from '@/store/slices/businessSlice';
import dailyLogsReducer from '@/store/slices/dailyLogsSlice';
import dashboardReducer from '@/store/slices/dashboardSlice';
import productReducer from '@/store/slices/productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    dailyLogs: dailyLogsReducer,
    dashboard: dashboardReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
