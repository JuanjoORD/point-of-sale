# Workflow recomendado con Copilot (Frontend)

## Estado actual del proyecto
- Fase 0 completada: app base, routing, auth shell y cliente API.
- Tailwind configurado como estandar para utilidades de UI.
- Tokens de color y assets centralizados en `src/shared/config/`.
- Bloque 5 completado: layout con sidebar, CRUD de categorias y ubicaciones.
- Bloque 6 completado: CRUD de productos/servicios en `/inventory/products`.
- Bloque 7 completado: CRUD de clientes en `/customers`.
- Bloque 8 completado: POS busqueda y carrito en `/sales` (Zustand + validacion de stock).
- Bloque 9 completado: checkout POS con cliente, descuento opcional, confirmacion y comprobante via POST `/ventas`.
- Bloque 10 completado: dashboard ventas del dia en `/` con KPIs, filtro por fecha/ubicacion y top productos via GET `/dashboard/ventas-dia`.
- Proximo bloque: Reporte ventas por rango (Bloque 11).

## Ciclo por sesion
1. Pedir estado actual del modulo.
2. Definir objetivo pequeno de UI/flujo.
3. Implementar componente/pagina.
4. Probar manualmente escenario principal.
5. Registrar avance en bitacora.

## Prompt plantilla
"Contexto: feature X. Objetivo: Y. Restricciones: React+TS, TanStack Query, Zustand, MUI, permisos por rol. Salida esperada: archivos + pruebas manuales."

## Reglas
- Pedir implementacion por pasos pequenos.
- Pedir manejo de estados loading/error/empty.
- Pedir accesibilidad minima (labels, focus, teclado).
- Pedir resumen de riesgos al final.

## Como usar este workflow ahora
- Reutilizar `DataTable`, `EntityDialog` y `QueryState` para nuevas pantallas maestras.
- Colores solo desde `shared/config/colors.ts`; logos/imagenes desde `shared/config/assets.ts`.
- Siguiente paso: reporte ventas por rango contra GET `/api/v1/reportes/ventas`.
- Mantener permisos con `PermissionGuard` y ocultar acciones segun rol.
