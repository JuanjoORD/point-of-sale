# Checklist QA Backend

## Estructura y calidad
- [ ] Compila sin errores.
- [ ] Lint sin errores criticos.
- [ ] Manejo de errores estandar.

## Seguridad
- [ ] Login y refresh correctos.
- [ ] Endpoints protegidos por permiso.
- [ ] Rate limit en auth.

## BD y reglas
- [ ] Tablas cumplen convencion MR_/MC_.
- [ ] Campos cumplen convencion minuscula.
- [ ] PK inicia con id_.
- [ ] Campos de auditoria en todas las tablas.
- [ ] Solo borrado logico.

## Funcionalidad
- [ ] CRUD de maestros estable.
- [ ] Inventario por ubicacion.
- [ ] Alerta por stock minimo.
- [ ] Venta crea cabecera + detalle + descuento inventario.
- [ ] Busqueda por nombre y codigo_barras.

## Reportes
- [ ] Ventas por rango.
- [ ] Top por cantidad.
- [ ] Top por valor.
- [ ] Dashboard ventas del dia.
