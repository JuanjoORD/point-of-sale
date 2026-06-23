# Rutas y permisos UI

## Rutas clave
- /login
- /
- /sales
- /inventory/products
- /inventory/categories
- /inventory/locations
- /customers
- /reports/sales
- /reports/top-products
- /settings/users
- /settings/roles
- /settings/profile

## Permisos sugeridos
- ventas:crear
- ventas:leer
- productos:leer
- productos:crear
- productos:editar
- inventario:leer
- inventario:editar
- reportes:leer
- usuarios:leer
- usuarios:crear
- roles:leer
- roles:editar

## Reglas de UI
- Ocultar menu sin permiso.
- Bloquear accion si no tiene permiso.
- Mostrar mensaje claro de acceso denegado.
- No confiar solo en frontend (backend siempre valida).
- Ruta inicial y menu lateral definidos en `src/shared/config/nav.config.ts`.
- Usuarios sin `reportes:leer` no usan `/` como home; se redirigen a su primera seccion permitida.

## Registro de productos (UI)

Ruta: `/inventory/products` (menu lateral **Productos**).

| Accion | Permiso | Roles con acceso |
|--------|---------|------------------|
| Ver listado | `productos:leer` | ADMIN, GERENTE, VENDEDOR, ALMACENERO |
| Crear producto | `productos:crear` | ADMIN, GERENTE, ALMACENERO |
| Editar / eliminar | `productos:editar` | ADMIN, GERENTE, ALMACENERO |

El rol **VENDEDOR** solo consulta catalogo; no puede crear productos.

## Proteccion administrador del sistema

Migracion `007_usuario_sistema.sql`: columna `es_usuario_sistema` en `MR_USUARIO`.

| Regla | Comportamiento |
|-------|----------------|
| Usuario marcado `es_usuario_sistema` | Solo puede editarse si quien opera es el mismo usuario (misma sesion) |
| Eliminar admin sistema | Bloqueado para todos |
| Otros ADMIN (ej. ADMIN_2) | Pueden gestionar otros usuarios, no el admin sistema |

