# Plan: Gestion de usuarios y roles (Backend)

Ver implementacion en frontend: `2026-1-front-point-of-sale/docs/10-PLAN-GESTION-USUARIOS-ROLES.md`

## Migracion requerida

Ejecutar en MSSQL **antes** de reiniciar el backend:

`src/database/migrations/006_usuario_gestor_seguridad.sql`

Agrega `es_gestor_seguridad` a `MR_USUARIO` y marca admin / rol ADMIN.

## API existente

- `/api/v1/usuarios` — CRUD + roles
- `/api/v1/roles` — CRUD + permisos

## API nueva

- `PUT /api/v1/auth/perfil` — actualizar nombre/contrasena propia (cualquier autenticado)

## Autorizacion

`authorize()` permite acceso si: rol ADMIN, `es_gestor_seguridad`, o permiso requerido.
