# Arquitectura Frontend

## Stack
- React + Vite + TypeScript
- TanStack Query
- Zustand
- MUI

## Estructura sugerida

```txt
src/
  app/
  router/
  auth/
  features/
    dashboard/
    sales/
    inventory/
    customers/
    reports/
    settings/
  shared/
    components/
    hooks/
    utils/
    types/
  services/
```

## Principios
- Feature-first.
- Componentes reutilizables en shared.
- Query cache para datos remotos.
- Store ligera para estado de UI y carrito POS.
- Guards por permisos en ruta y componente.
