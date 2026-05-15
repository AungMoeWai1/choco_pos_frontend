import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleGuard: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/pos" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/pos" replace />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="dashboard" element={
              <RoleGuard roles={['admin', 'manager']}>
                <DashboardPage />
              </RoleGuard>
            } />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={
              <RoleGuard roles={['admin', 'manager']}>
                <ProductsPage />
              </RoleGuard>
            } />
            <Route path="categories" element={
              <RoleGuard roles={['admin', 'manager']}>
                <CategoriesPage />
              </RoleGuard>
            } />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="reports" element={
              <RoleGuard roles={['admin', 'manager']}>
                <ReportsPage />
              </RoleGuard>
            } />
            <Route path="settings" element={
              <RoleGuard roles={['admin', 'manager']}>
                <SettingsPage />
              </RoleGuard>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
