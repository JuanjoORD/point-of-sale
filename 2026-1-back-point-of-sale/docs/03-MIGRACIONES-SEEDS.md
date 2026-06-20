# Plan de Migraciones y Seeds

## Objetivo
Crear base reproducible en ambiente limpio con versionado incremental.

## Orden de migraciones
1. Seguridad base
- MR_USUARIO
- MR_ROL
- MR_PERMISO
- MR_USUARIO_ROL
- MR_ROL_PERMISO

2. Catalogos
- MC_CATEGORIA
- MC_UBICACION

3. Productos e inventario
- MR_PRODUCTO
- MR_INVENTARIO_UBICACION
- MR_MOVIMIENTO_INVENTARIO
- MR_ALERTA_STOCK

4. Comercial
- MR_CLIENTE
- MR_VENTA
- MR_VENTA_DETALLE

## Seeds iniciales
- Roles: ADMIN, GERENTE, VENDEDOR, ALMACENERO.
- Permisos por recurso:accion.
- Usuario admin inicial.
- Ubicacion principal.
- Cliente consumidor final.

## Reglas
- Cada migracion debe tener rollback.
- No editar migraciones ya aplicadas en otros ambientes.
- Usar una migracion nueva para cambios de esquema.
- Seeds idempotentes.

## Validacion post migracion
- Verificar PK/FK.
- Verificar indices.
- Verificar campos de auditoria en todas las tablas.
- Verificar filtros por borrado logico.
