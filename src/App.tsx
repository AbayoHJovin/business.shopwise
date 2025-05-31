import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import Redux-based components for authentication and route protection
import ReduxAuthProvider from "./components/auth/ReduxAuthProvider";
import ReduxProtectedRoute from "./components/auth/ReduxProtectedRoute";
import Index from "./pages/Index";
import NotFound from "@/pages/NotFound";
import UpdateProduct from "@/pages/products/UpdateProduct";
import ProductCreate from "./pages/ProductCreate";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeEdit from "./pages/EmployeeEdit";
import EmployeeAdd from "./pages/EmployeeAdd";
import EmployeeSalaryPayments from "./pages/EmployeeSalaryPayments";
import Expenses from "./pages/Expenses";
import ExpenseAdd from "./pages/expenses/ExpenseAdd";
import LandingPage from "./pages/LandingPage";
import Sales from "./pages/Sales";
import SaleAdd from "./pages/sales/SaleAdd";
// Availability page removed
import Settings from "./pages/Settings";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import SignupTest from "./components/auth/SignupTest";
import BusinessSelection from "./pages/business/BusinessSelection";
import BusinessCreate from "./pages/business/BusinessCreate";
import DailyLogs from "./pages/DailyLogs";
import UpdateBusiness from "./pages/settings/UpdateBusiness";
import ProfilePage from "./pages/settings/ProfilePage";
import Products from "./pages/Products";
import AiChat from "./pages/ai-chat";
import ManualPaymentPage from "./pages/payment/ManualPaymentPage";
// Import Business Discovery pages
import BusinessesPage from "./pages/businesses";
import BusinessDetail from "./pages/businesses/detail";

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/test-signup" element={<SignupTest />} />

            {/* Business Routes - Protected */}
            <Route
              path="/business/select"
              element={
                <ReduxProtectedRoute>
                  <BusinessSelection />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/business/create"
              element={
                <ReduxProtectedRoute>
                  <BusinessCreate />
                </ReduxProtectedRoute>
              }
            />

            {/* Business Discovery Routes */}
            <Route path="/businesses" element={<BusinessesPage />} />
            <Route path="/businesses/:id" element={<BusinessDetail />} />

            {/* Dashboard Routes - Protected */}
            <Route
              path="/dashboard"
              element={
                <ReduxProtectedRoute>
                  <Index />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ReduxProtectedRoute>
                  <Products />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ReduxProtectedRoute>
                  <ProductCreate />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:productId"
              element={
                <ReduxProtectedRoute>
                  <UpdateProduct />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ReduxProtectedRoute>
                  <Employees />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ReduxProtectedRoute>
                  <EmployeeDetail />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <ReduxProtectedRoute>
                  <EmployeeAdd />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/employees/edit/:id"
              element={
                <ReduxProtectedRoute>
                  <EmployeeEdit />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/salary-payments/:id"
              element={
                <ReduxProtectedRoute>
                  <EmployeeSalaryPayments />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ReduxProtectedRoute>
                  <Expenses />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/expenses/add"
              element={
                <ReduxProtectedRoute>
                  <ExpenseAdd />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ReduxProtectedRoute>
                  <Sales />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/sales/add"
              element={
                <ReduxProtectedRoute>
                  <SaleAdd />
                </ReduxProtectedRoute>
              }
            />
            {/* Availability route removed */}
            <Route
              path="/daily-logs"
              element={
                <ReduxProtectedRoute>
                  <DailyLogs />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ReduxProtectedRoute>
                  <AiChat />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ReduxProtectedRoute>
                  <Settings />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/settings/business/update"
              element={
                <ReduxProtectedRoute>
                  <UpdateBusiness />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <ReduxProtectedRoute>
                  <ProfilePage />
                </ReduxProtectedRoute>
              }
            />
            <Route
              path="/payment/:planType"
              element={
                <ReduxProtectedRoute>
                  <ManualPaymentPage />
                </ReduxProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ReduxAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
