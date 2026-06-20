// ── Permisos del sistema (recurso:accion) ─────────────────────────────────────
export const PERMISSIONS = {
  // Usuarios
  USUARIOS_LEER: 'usuarios:leer',
  USUARIOS_CREAR: 'usuarios:crear',
  USUARIOS_EDITAR: 'usuarios:editar',
  // Roles
  ROLES_LEER: 'roles:leer',
  ROLES_CREAR: 'roles:crear',
  ROLES_EDITAR: 'roles:editar',
  // Productos
  PRODUCTOS_LEER: 'productos:leer',
  PRODUCTOS_CREAR: 'productos:crear',
  PRODUCTOS_EDITAR: 'productos:editar',
  // Inventario
  INVENTARIO_LEER: 'inventario:leer',
  INVENTARIO_EDITAR: 'inventario:editar',
  // Clientes
  CLIENTES_LEER: 'clientes:leer',
  CLIENTES_CREAR: 'clientes:crear',
  CLIENTES_EDITAR: 'clientes:editar',
  // Ventas
  VENTAS_CREAR: 'ventas:crear',
  VENTAS_LEER: 'ventas:leer',
  // Reportes
  REPORTES_LEER: 'reportes:leer',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
