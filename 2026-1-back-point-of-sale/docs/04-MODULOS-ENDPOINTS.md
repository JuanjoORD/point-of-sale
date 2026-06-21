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
- GET /api/v1/inventario?id_producto=&id_ubicacion=&solo_bajo_stock=
- POST /api/v1/inventario
- GET /api/v1/inventario/:id_inventario_ubicacion
- PUT /api/v1/inventario/:id_inventario_ubicacion
- GET /api/v1/inventario/alertas?todas=

### Clientes y ventas
- GET/POST/PUT /api/v1/clientes
- POST /api/v1/ventas
  - Body: `{ id_cliente, id_ubicacion, descuento_adicional?, impuesto_total?, observaciones?, detalle: [{ id_producto, cantidad, precio_unitario?, descuento_linea? }] }`
  - Transaccion atomica: cabecera + detalle + movimientos VENTA en inventario (productos no-servicio).
- GET /api/v1/ventas?id_ubicacion=&id_cliente=&fecha_inicio=&fecha_fin=&estado=
- GET /api/v1/ventas/:id_venta

### Dashboard/reportes
- GET /api/v1/dashboard/ventas-dia?fecha=&id_ubicacion=
  - Resumen del dia: total_ventas, cantidad_tickets, ticket_promedio, top_productos (top 5).
- GET /api/v1/reportes/ventas?fecha_inicio=&fecha_fin=&id_ubicacion=
  - Resumen por rango: total_ventas, cantidad_tickets, ticket_promedio.
- GET /api/v1/reportes/top-productos-cantidad?fecha_inicio=&fecha_fin=&id_ubicacion=&limit=
- GET /api/v1/reportes/top-productos-valor?fecha_inicio=&fecha_fin=&id_ubicacion=&limit=
- Permiso requerido: reportes:leer

## Permisos sugeridos
Formato: recurso:accion
- usuarios:leer, usuarios:crear, usuarios:editar
- roles:leer, roles:crear, roles:editar
- productos:leer, productos:crear, productos:editar
- inventario:leer, inventario:editar
- ventas:crear, ventas:leer
- reportes:leer
