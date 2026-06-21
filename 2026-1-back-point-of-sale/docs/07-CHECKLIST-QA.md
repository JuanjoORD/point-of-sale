# Checklist QA Backend

## Estructura y calidad
- [x] Compila sin errores.
- [x] Lint sin errores criticos.
- [x] Manejo de errores estandar.

## Seguridad
- [x] Login y refresh correctos.
- [x] Endpoints protegidos por permiso.
- [x] Rate limit en auth.

## BD y reglas
- [x] Tablas cumplen convencion MR_/MC_.
- [x] Campos cumplen convencion minuscula.
- [x] PK inicia con id_.
- [x] Campos de auditoria en todas las tablas.
- [x] Solo borrado logico.

## Funcionalidad
- [x] CRUD de maestros estable.
- [x] Inventario por ubicacion.
- [x] Alerta por stock minimo.
- [x] Venta crea cabecera + detalle + descuento inventario.
- [x] Busqueda por nombre y codigo_barras.

## Reportes
- [x] Ventas por rango.
- [x] Top por cantidad.
- [x] Top por valor.
- [x] Dashboard ventas del dia.

## Pruebas automaticas
- [x] Smoke API (`npm test`).
- [x] Integracion opcional con BD (`npm run test:integration`).

Ver detalle en `10-PRUEBAS-INTEGRACION.md`.
