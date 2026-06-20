# Arquitectura Backend

## Stack
- Node.js
- Express
- TypeScript
- Sequelize
- MSSQL
- JWT access + refresh

## Estructura sugerida

```txt
src/
  app.ts
  server.ts
  config/
  middlewares/
  modules/
    auth/
    usuarios/
    roles-permisos/
    categorias/
    productos/
    ubicaciones/
    inventario/
    clientes/
    ventas/
    reportes/
  database/
    migrations/
    seeds/
  shared/
    errors/
    utils/
    validators/
```

## Principios
- Separar controller, service y repository.
- Validar input en borde (DTO/schema).
- No meter SQL en controller.
- Todas las operaciones de venta e inventario en transaccion.
- Errores normalizados (codigo + mensaje).

## Convenciones API
- Prefijo: /api/v1
- JSON estandar de respuesta.
- Paginacion en listados.
- Filtros por query params.
- Soft delete en todas las tablas.
