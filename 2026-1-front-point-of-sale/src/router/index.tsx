import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/contexts/AuthContext';
import LoginPage from '../auth/pages/LoginPage';
import MainLayout from '../shared/components/Layout/MainLayout';

/**
 * Rutas de la aplicación.
 * Las rutas protegidas sólo son accesibles con sesión activa.
 * Las páginas de cada módulo se añaden aquí a medida que se implementan.
 */
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
        {/* Dashboard — Fase 7 */}
        <Route index element={<div>Dashboard (próximamente)</div>} />

        {/* Catálogos — Fase 4 */}
        {/* <Route path="inventory/categories" element={<CategoriesPage />} /> */}
        {/* <Route path="inventory/locations" element={<LocationsPage />} /> */}
        {/* <Route path="inventory/products" element={<ProductsPage />} /> */}

        {/* Clientes — Fase 4 */}
        {/* <Route path="customers" element={<CustomersPage />} /> */}

        {/* POS — Fase 6 */}
        {/* <Route path="sales" element={<SalesPage />} /> */}

        {/* Reportes — Fase 7 */}
        {/* <Route path="reports/sales" element={<SalesReportPage />} /> */}
        {/* <Route path="reports/top-products" element={<TopProductsReportPage />} /> */}

        {/* Configuración — Fase 4 */}
        {/* <Route path="settings/users" element={<UsersPage />} /> */}
        {/* <Route path="settings/roles" element={<RolesPage />} /> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/login" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
