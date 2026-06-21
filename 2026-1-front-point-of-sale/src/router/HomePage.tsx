import { Navigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { useAuth } from '@/auth/contexts/AuthContext';
import { resolveDefaultRoute } from '@/shared/config/nav.config';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';

function HomePage() {
  const { hasPermission } = useAuth();

  if (hasPermission(PERMISSIONS.REPORTES_LEER)) {
    return <DashboardPage />;
  }

  const fallback = resolveDefaultRoute(hasPermission);
  if (fallback && fallback !== '/') {
    return <Navigate to={fallback} replace />;
  }

  return (
    <Box className="py-4">
      <Alert severity="warning">
        Tu usuario no tiene permisos para acceder a ninguna seccion del sistema.
      </Alert>
    </Box>
  );
}

export default HomePage;
