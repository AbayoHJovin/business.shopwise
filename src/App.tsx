
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import Redux-based components for authentication and route protection
import ReduxAuthProvider from "./components/auth/ReduxAuthProvider";
import ReduxProtectedRoute from "./components/auth/ReduxProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import Employees from "./pages/Employees";
import Expenses from "./pages/Expenses";
import LandingPage from "./pages/LandingPage";
import Sales from "./pages/Sales";
import Availability from "./pages/Availability";
import Settings from "./pages/Settings";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignupTest from "./components/auth/SignupTest";
import BusinessSelection from "./pages/business/BusinessSelection";
import BusinessCreate from "./pages/business/BusinessCreate";
import DailyLogs from "./pages/DailyLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ReduxAuthProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Authentication Routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-signup" element={<SignupTest />} />
          
          {/* Business Routes - Protected */}
          <Route path="/business/select" element={<ReduxProtectedRoute><BusinessSelection /></ReduxProtectedRoute>} />
          <Route path="/business/create" element={<ReduxProtectedRoute><BusinessCreate /></ReduxProtectedRoute>} />
          
          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={<ReduxProtectedRoute><Index /></ReduxProtectedRoute>} />
          <Route path="/products" element={<ReduxProtectedRoute><Products /></ReduxProtectedRoute>} />
          <Route path="/products/new" element={<ReduxProtectedRoute><ProductCreate /></ReduxProtectedRoute>} />
          <Route path="/employees" element={<ReduxProtectedRoute><Employees /></ReduxProtectedRoute>} />
          <Route path="/employees/new" element={<ReduxProtectedRoute><NotFound /></ReduxProtectedRoute>} />
          <Route path="/employees/edit/:id" element={<ReduxProtectedRoute><NotFound /></ReduxProtectedRoute>} />
          <Route path="/expenses" element={<ReduxProtectedRoute><Expenses /></ReduxProtectedRoute>} />
          <Route path="/sales" element={<ReduxProtectedRoute><Sales /></ReduxProtectedRoute>} />
          <Route path="/availability" element={<ReduxProtectedRoute><Availability /></ReduxProtectedRoute>} />
          <Route path="/daily-logs" element={<ReduxProtectedRoute><DailyLogs /></ReduxProtectedRoute>} />
          <Route path="/settings" element={<ReduxProtectedRoute><Settings /></ReduxProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ReduxAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
