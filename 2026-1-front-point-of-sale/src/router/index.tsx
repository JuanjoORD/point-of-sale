import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/contexts/AuthContext';
import LoginPage from '../auth/pages/LoginPage';
import MainLayout from '../shared/components/Layout/MainLayout';
import CategoriesPage from '../features/inventory/pages/CategoriesPage';
import LocationsPage from '../features/inventory/pages/LocationsPage';
import ProductsPage from '../features/inventory/pages/ProductsPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import SalesPage from '../features/sales/pages/SalesPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';

function AppRouter() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory/categories" element={<CategoriesPage />} />
        <Route path="inventory/locations" element={<LocationsPage />} />
        <Route path="inventory/products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/login" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
