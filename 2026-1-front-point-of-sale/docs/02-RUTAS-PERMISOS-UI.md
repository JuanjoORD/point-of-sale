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
