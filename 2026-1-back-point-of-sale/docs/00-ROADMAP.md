# Roadmap Backend POS Inventario

## Objetivo
Construir API robusta para inventario y punto de venta con MSSQL + Node.js + Express + TypeScript + Sequelize.

## Alcance MVP
- Auth JWT (access + refresh).
- Usuarios, roles y permisos por accion.
- Catalogos: categorias, ubicaciones.
- Productos/servicios con categoria opcional.
- Inventario por ubicacion con alerta de stock minimo.
- Ventas con cliente (nombre, direccion, NIT), descuento opcional.
- Dashboard ventas del dia.
- Reportes por rango de fechas y top productos.

## Orden recomendado
1. Fundacion del proyecto y convenciones.
2. Modelo MSSQL + migraciones + seeds base.
3. Auth y middleware de permisos.
4. CRUD maestros.
5. Inventario y alertas.
6. Flujo de ventas transaccional.
7. Dashboard y reportes.
8. QA, hardening y cierre MVP.

## Criterio de terminado del backend
- Endpoints versionados y validados.
- Permisos por recurso:accion en cada endpoint.
- Logica de venta atomica dentro de transaccion DB.
- Reportes validados contra datos de prueba.
- Documentacion actualizada en esta carpeta docs.
