# Base de Datos MSSQL - Estandar obligatorio

## Regla 1: nombre de tablas
- Mayusculas.
- Palabras separadas por guion bajo.
- Prefijo `MR_` para tablas de registro/transaccion.
- Prefijo `MC_` para tablas catalogo.

Ejemplos:
- MR_USUARIO
- MR_VENTA
- MR_VENTA_DETALLE
- MC_CATEGORIA
- MC_UBICACION

## Regla 2: nombre de campos
- Minusculas.
- Palabras separadas por guion bajo.
- PK inicia con `id_` + nombre descriptivo.

Ejemplos:
- id_usuario
- id_venta
- id_venta_detalle
- id_categoria

## Regla 3: campos de auditoria obligatorios en TODAS las tablas
- borrado (bit, default 0)
- usuario_borrado (nvarchar o FK usuario, nullable)
- fecha_borrado (datetime2, nullable)
- usuario_ingreso (nvarchar o FK usuario)
- fecha_ingreso (datetime2)
- usuario_actualiza (nvarchar o FK usuario, nullable)
- fecha_actualiza (datetime2, nullable)

## Regla 4: borrado logico
- No se permite DELETE fisico en flujo normal.
- Toda eliminacion marca `borrado = 1` y completa metadatos de borrado.
- Todas las consultas del sistema deben filtrar `borrado = 0`.

## Tablas minimas del MVP
### Seguridad
- MR_USUARIO
- MR_ROL
- MR_PERMISO
- MR_USUARIO_ROL
- MR_ROL_PERMISO

### Catalogos
- MC_CATEGORIA
- MC_UBICACION

### Inventario
- MR_PRODUCTO
- MR_INVENTARIO_UBICACION
- MR_MOVIMIENTO_INVENTARIO
- MR_ALERTA_STOCK

### Comercial
- MR_CLIENTE
- MR_VENTA
- MR_VENTA_DETALLE

## Indices minimos recomendados
- MR_PRODUCTO(nombre_producto)
- MR_PRODUCTO(codigo_barras)
- MR_CLIENTE(nit)
- MR_VENTA(fecha_venta)
- MR_VENTA_DETALLE(id_producto)
- MR_INVENTARIO_UBICACION(id_producto, id_ubicacion) unique

## Nota de implementacion
Documentar cada tabla en migraciones con comentario de negocio y validar constraints de no negativos para cantidades y montos.
