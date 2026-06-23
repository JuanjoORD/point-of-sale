import { PERMISSIONS, Permission } from '../types/permissions.types';

export interface AppNavItemConfig {
  label: string;
  path: string;
  /** Si se omite, visible para cualquier usuario autenticado. */
  permission?: Permission;
  /** Usa canManageSecurity (permiso o es_gestor_seguridad). */
  securityOnly?: boolean;
}

/** Orden de prioridad para menu lateral y ruta inicial post-login. */
export const APP_NAV_ITEMS: AppNavItemConfig[] = [
  { label: 'Dashboard', path: '/', permission: PERMISSIONS.REPORTES_LEER },
  { label: 'Reporte ventas', path: '/reports/sales', permission: PERMISSIONS.REPORTES_LEER },
  { label: 'Top productos', path: '/reports/top-products', permission: PERMISSIONS.REPORTES_LEER },
  { label: 'Punto de venta', path: '/sales', permission: PERMISSIONS.VENTAS_CREAR },
  { label: 'Categorias', path: '/inventory/categories', permission: PERMISSIONS.PRODUCTOS_LEER },
  { label: 'Ubicaciones', path: '/inventory/locations', permission: PERMISSIONS.INVENTARIO_LEER },
  { label: 'Productos', path: '/inventory/products', permission: PERMISSIONS.PRODUCTOS_LEER },
  { label: 'Clientes', path: '/customers', permission: PERMISSIONS.CLIENTES_LEER },
  { label: 'Usuarios', path: '/settings/users', permission: PERMISSIONS.USUARIOS_LEER, securityOnly: true },
  { label: 'Roles', path: '/settings/roles', permission: PERMISSIONS.ROLES_LEER, securityOnly: true },
  { label: 'Mi cuenta', path: '/settings/profile' },
];

export function canSeeNavItem(
  item: AppNavItemConfig,
  hasPermission: (permission: string) => boolean,
  canManageSecurity: (permission: string) => boolean,
): boolean {
  if (!item.permission) return true;
  if (item.securityOnly) return canManageSecurity(item.permission);
  return hasPermission(item.permission);
}

export function resolveDefaultRoute(
  hasPermission: (permission: string) => boolean,
  canManageSecurity?: (permission: string) => boolean,
): string | null {
  const checkSecurity = canManageSecurity ?? hasPermission;
  const match = APP_NAV_ITEMS.find((item) => canSeeNavItem(item, hasPermission, checkSecurity));
  return match?.path ?? null;
}

export function canAccessRoute(
  path: string,
  hasPermission: (permission: string) => boolean,
  canManageSecurity?: (permission: string) => boolean,
): boolean {
  const item = APP_NAV_ITEMS.find((entry) => entry.path === path);
  if (!item) return path === '/settings/profile';
  const checkSecurity = canManageSecurity ?? hasPermission;
  return canSeeNavItem(item, hasPermission, checkSecurity);
}

export function getNavItemByPath(pathname: string): AppNavItemConfig | undefined {
  if (pathname === '/') {
    return APP_NAV_ITEMS.find((item) => item.path === '/');
  }

  const matches = APP_NAV_ITEMS.filter(
    (item) =>
      item.path !== '/' &&
      (pathname === item.path || pathname.startsWith(`${item.path}/`)),
  );

  return matches.sort((a, b) => b.path.length - a.path.length)[0];
}
