import { Navigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { useAuth } from '@/auth/contexts/AuthContext';
import { resolveDefaultRoute } from '@/shared/config/nav.config';

function DefaultRouteRedirect() {
  const { hasPermission, canManageSecurity } = useAuth();
  const target = resolveDefaultRoute(hasPermission, canManageSecurity);

  if (target) {
    return <Navigate to={target} replace />;
  }

  return (
    <Box className="py-4">
      <Alert severity="warning">
        No tienes permiso para acceder a esta seccion.
      </Alert>
    </Box>
  );
}

export default DefaultRouteRedirect;
