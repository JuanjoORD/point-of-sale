import { PERMISSIONS, Permission } from '../types/permissions.types';

export interface AppNavItemConfig {
  label: string;
  path: string;
  permission: Permission;
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
];

export function resolveDefaultRoute(
  hasPermission: (permission: string) => boolean,
): string | null {
  const match = APP_NAV_ITEMS.find((item) => hasPermission(item.permission));
  return match?.path ?? null;
}

export function canAccessRoute(
  path: string,
  hasPermission: (permission: string) => boolean,
): boolean {
  const item = APP_NAV_ITEMS.find((entry) => entry.path === path);
  if (!item) return false;
  return hasPermission(item.permission);
}
