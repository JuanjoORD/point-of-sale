# Cierre MVP Frontend

## Estado

**MVP frontend completado** (Bloques 0–14).

## Alcance entregado

| Area | Rutas | Estado |
|------|-------|--------|
| Auth y layout | `/login`, layout con sidebar | OK |
| Dashboard | `/` | OK |
| POS | `/sales` | OK |
| Catalogos | `/inventory/categories`, `/inventory/locations`, `/inventory/products` | OK |
| Clientes | `/customers` | OK |
| Reportes | `/reports/sales`, `/reports/top-products` | OK |
| Permisos por rol | Menu, guards, ruta inicial | OK |
| Exportacion CSV | Reportes ventas y top productos | OK |

## Ajustes UX (Bloque 14)

- Titulo de pestana dinamico segun seccion activa.
- Encabezado con nombre de seccion y menu hamburguesa en movil.
- Sidebar responsivo (permanente en desktop, drawer en movil).
- Atajos POS: Enter agrega primer resultado; Esc limpia busqueda.

## Fuera de alcance MVP (fase siguiente)

- Pantallas `/settings/users` y `/settings/roles`.
- Alertas de stock en dashboard.
- Exportacion PDF.
- Historial detallado de ventas en UI.
- Tests automatizados E2E en frontend.

## Como ejecutar

```bash
cd 2026-1-front-point-of-sale
npm install
npm run dev
```

Requiere backend activo en `/api/v1` (proxy Vite o mismo host).

## Documentacion relacionada

- `08-QA-POR-ROL.md` — matriz de permisos validada.
- `02-RUTAS-PERMISOS-UI.md` — rutas y reglas de UI.
- `07-BITACORA-PROGRESO.md` — historial de sesiones.

## Criterios de aceptacion MVP

- [x] Login con JWT y refresh.
- [x] CRUD maestros con permisos.
- [x] POS con carrito, cliente, descuento y comprobante.
- [x] Dashboard y reportes consumiendo API v1.
- [x] QA por rol documentado y redireccion inicial corregida.
- [x] Build de produccion sin errores TypeScript.
