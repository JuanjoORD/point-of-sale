# Modulos y Endpoints Backend

## Modulos
- auth
- usuarios
- roles-permisos
- categorias
- ubicaciones
- productos
- inventario
- clientes
- ventas
- reportes

## Endpoints clave (resumen)
### Auth
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/perfil

### Seguridad
- GET /api/v1/usuarios
- POST /api/v1/usuarios
- PUT /api/v1/usuarios/:id_usuario
- GET /api/v1/roles
- POST /api/v1/roles
- GET /api/v1/permisos
- POST /api/v1/roles/:id_rol/permisos

### Catalogos
- GET/POST/PUT /api/v1/categorias
- GET/POST/PUT /api/v1/ubicaciones

### Productos/Inventario
- GET/POST/PUT /api/v1/productos
- GET /api/v1/productos/buscar?q=&codigo_barras=
- GET/PUT /api/v1/inventario
- GET /api/v1/inventario/alertas

### Clientes y ventas
- GET/POST/PUT /api/v1/clientes
- POST /api/v1/ventas
- GET /api/v1/ventas
- GET /api/v1/ventas/:id_venta

### Dashboard/reportes
- GET /api/v1/dashboard/ventas-dia
- GET /api/v1/reportes/ventas?fecha_inicio=&fecha_fin=
- GET /api/v1/reportes/top-productos-cantidad?fecha_inicio=&fecha_fin=
- GET /api/v1/reportes/top-productos-valor?fecha_inicio=&fecha_fin=

## Permisos sugeridos
Formato: recurso:accion
- usuarios:leer, usuarios:crear, usuarios:editar
- roles:leer, roles:crear, roles:editar
- productos:leer, productos:crear, productos:editar
- inventario:leer, inventario:editar
- ventas:crear, ventas:leer
- reportes:leer
