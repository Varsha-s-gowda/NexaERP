import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
// Signup removed: no public registration
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import StockMovements from './pages/StockMovements';
import SalesChallans from './pages/SalesChallans';
import Reports from './pages/reports';
import Settings from './pages/Settings';

import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Signup route removed to disable public registration */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","SALES","ACCOUNTS"]}>
            <Customers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","WAREHOUSE"]}>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouses"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","WAREHOUSE"]}>
            <Warehouses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock-movements"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","WAREHOUSE"]}>
            <StockMovements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales-challans"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","SALES","ACCOUNTS"]}>
            <SalesChallans />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN","SALES","WAREHOUSE","ACCOUNTS"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;