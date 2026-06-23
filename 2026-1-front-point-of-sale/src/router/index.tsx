import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/contexts/AuthContext';
import LoginPage from '../auth/pages/LoginPage';
import MainLayout from '../shared/components/Layout/MainLayout';
import CategoriesPage from '../features/inventory/pages/CategoriesPage';
import LocationsPage from '../features/inventory/pages/LocationsPage';
import ProductsPage from '../features/inventory/pages/ProductsPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import SalesPage from '../features/sales/pages/SalesPage';
import SalesReportPage from '../features/reports/pages/SalesReportPage';
import TopProductsReportPage from '../features/reports/pages/TopProductsReportPage';
import UsersPage from '../features/settings/pages/UsersPage';
import RolesPage from '../features/settings/pages/RolesPage';
import ProfilePage from '../features/settings/pages/ProfilePage';
import HomePage from './HomePage';
import DefaultRouteRedirect from './DefaultRouteRedirect';

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
        <Route index element={<HomePage />} />
        <Route path="inventory/categories" element={<CategoriesPage />} />
        <Route path="inventory/locations" element={<LocationsPage />} />
        <Route path="inventory/products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="reports/sales" element={<SalesReportPage />} />
        <Route path="reports/top-products" element={<TopProductsReportPage />} />
        <Route path="settings/users" element={<UsersPage />} />
        <Route path="settings/roles" element={<RolesPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="*" element={<DefaultRouteRedirect />} />
      </Route>

      <Route path="/login" element={<DefaultRouteRedirect />} />
    </Routes>
  );
}

export default AppRouter;
