# QA funcional por rol (Frontend MVP)

Documento de validacion del Bloque 13. La fuente de verdad del menu y la ruta inicial es `src/shared/config/nav.config.ts`.

## Roles del seed

| Rol | Permisos clave |
|-----|----------------|
| ADMIN | Todos |
| GERENTE | Catalogo, inventario, clientes, ventas, reportes |
| VENDEDOR | Catalogo lectura, clientes crear/leer, ventas |
| ALMACENERO | Catalogo CRUD, inventario CRUD |

## Ruta inicial post-login

| Rol | Ruta inicial |
|-----|--------------|
| ADMIN / GERENTE | `/` (Dashboard) |
| VENDEDOR | `/sales` |
| ALMACENERO | `/inventory/categories` |

## Matriz menu lateral

| Seccion | Permiso | ADMIN | GERENTE | VENDEDOR | ALMACENERO |
|---------|---------|:-----:|:-------:|:--------:|:----------:|
| Dashboard | reportes:leer | Si | Si | No | No |
| Reporte ventas | reportes:leer | Si | Si | No | No |
| Top productos | reportes:leer | Si | Si | No | No |
| Punto de venta | ventas:crear | Si | Si | Si | No |
| Categorias | productos:leer | Si | Si | Si | Si |
| Ubicaciones | inventario:leer | Si | Si | No | Si |
| Productos | productos:leer | Si | Si | Si | Si |
| Clientes | clientes:leer | Si | Si | Si | No |

## Matriz acciones por pantalla

| Pantalla | Accion | Permiso requerido | VENDEDOR | ALMACENERO |
|----------|--------|-------------------|:--------:|:----------:|
| Categorias | Crear/editar/eliminar | productos:crear / editar | No | Si |
| Ubicaciones | Crear/editar/eliminar | inventario:editar | No | Si |
| Productos | Crear/editar | productos:crear / editar | No | Si |
| Clientes | Crear | clientes:crear | Si | No |
| Clientes | Editar/eliminar | clientes:editar | No | No |
| POS checkout | Selector ubicacion | inventario:leer | Fallback Principal | N/A |
| Reportes | Filtro ubicacion | inventario:leer | N/A | N/A |

## Proteccion de rutas

- Cada pagina usa `PermissionGuard` con el permiso minimo de lectura o accion.
- Rutas desconocidas redirigen a la primera seccion permitida (`DefaultRouteRedirect`).
- Usuarios sin permisos de menu ven mensaje claro en `/`.

## Checklist manual recomendado

1. Login como GERENTE: ver Dashboard, reportes, POS y maestros completos.
2. Login como VENDEDOR: aterrizar en POS; no ver reportes; catalogo solo lectura; clientes solo crear.
3. Login como ALMACENERO: aterrizar en categorias; no ver POS ni clientes; inventario editable.
4. Navegar manualmente a `/reports/sales` como VENDEDOR: mensaje de acceso denegado.
5. Completar venta como VENDEDOR con ubicacion predeterminada (Principal).
6. Exportar CSV en reportes como GERENTE.

## Correcciones aplicadas en Bloque 13

- Centralizacion de rutas y permisos del menu en `nav.config.ts`.
- `HomePage` redirige a la primera ruta permitida si el usuario no tiene `reportes:leer`.
- `DefaultRouteRedirect` para rutas invalidas y post-login segun rol.

## Riesgos residuales

- El frontend oculta acciones pero el backend sigue siendo la autoridad final.
- Rutas `/settings/*` del roadmap aun no implementadas (fuera de MVP actual).
