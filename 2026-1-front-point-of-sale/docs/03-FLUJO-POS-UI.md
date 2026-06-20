# Flujo POS UI

## Objetivo
Permitir venta rapida, con validaciones claras y minima friccion.

## Flujo
1. Buscar producto por nombre o codigo_barras.
2. Agregar al carrito.
3. Ajustar cantidad.
4. Aplicar descuento opcional.
5. Capturar/seleccionar cliente (nombre, direccion, NIT).
6. Confirmar venta.
7. Mostrar comprobante y limpiar carrito.

## Validaciones
- No permitir cantidad mayor al stock (si no es servicio).
- No permitir montos negativos.
- Validar cliente minimo para facturacion.
- Mostrar errores de backend de forma amigable.

## UX minima
- Input de busqueda con foco automatico.
- Atajos teclado para caja.
- Totales visibles siempre.
- Confirmacion final antes de enviar.
