import { ReactNode } from 'react';
import { Alert } from '@mui/material';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface PermissionGuardProps {
  permiso: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza `children` sólo si el usuario autenticado tiene el permiso.
 * Muestra `fallback` en caso contrario (por defecto: mensaje de acceso denegado).
 */
function PermissionGuard({ permiso, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permiso)) {
    return (
      <>
        {fallback ?? (
          <Alert severity="warning">No tienes permiso para acceder a esta sección.</Alert>
        )}
      </>
    );
  }

  return <>{children}</>;
}

export default PermissionGuard;
