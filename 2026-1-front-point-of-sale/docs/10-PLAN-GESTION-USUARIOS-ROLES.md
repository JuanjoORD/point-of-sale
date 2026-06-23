# Plan: Gestion de usuarios y roles

## Objetivo

Pantallas de administracion para usuarios y roles, con control de acceso por permisos RBAC y flag `es_gestor_seguridad` en `MR_USUARIO`.

## Alcance

### Usuarios (`/settings/users`)
- Listar, crear, editar y eliminar (borrado logico)
- Asignar o quitar roles al usuario
- Campos: nombre, email, contrasena, activo, roles[]

### Roles (`/settings/roles`)
- Listar, crear, editar y eliminar roles
- Asignar o quitar permisos al rol
- Campos: nombre_rol, descripcion, permisos[]

### Mi cuenta (`/settings/profile`)
- Cualquier usuario autenticado puede editar **su propio** nombre y contrasena
- Sin permisos `usuarios:*`

## Modelo de acceso

| Accion | Permiso RBAC | Alternativa |
|--------|--------------|-------------|
| Ver usuarios | `usuarios:leer` | `es_gestor_seguridad = 1` o rol ADMIN |
| Crear usuarios | `usuarios:crear` | idem |
| Editar/eliminar usuarios | `usuarios:editar` | idem |
| Ver roles | `roles:leer` | idem |
| Crear roles | `roles:crear` | idem |
| Editar/eliminar roles | `roles:editar` | idem |
| Editar perfil propio | autenticado | siempre |

## Cambios en base de datos

Migracion `006_usuario_gestor_seguridad.sql`:

```sql
ALTER TABLE MR_USUARIO ADD es_gestor_seguridad BIT NOT NULL DEFAULT 0;
-- Marcar gestores: admin@pos.local y usuarios con rol ADMIN
```

## API backend (existente + nuevas)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/usuarios` | Listado paginado |
| GET | `/usuarios/:id` | Detalle |
| GET | `/usuarios/roles-disponibles` | Roles para asignacion |
| POST | `/usuarios` | Crear |
| PUT | `/usuarios/:id` | Actualizar |
| DELETE | `/usuarios/:id` | Eliminar |
| GET | `/roles` | Listado roles |
| GET | `/roles/permisos` | Catalogo permisos |
| GET | `/roles/:id` | Detalle rol |
| POST | `/roles` | Crear rol |
| PUT | `/roles/:id` | Actualizar rol |
| DELETE | `/roles/:id` | Eliminar rol |
| PUT | `/auth/perfil` | **Nuevo** — actualizar nombre/contrasena propia |

## Frontend

```
src/features/settings/
  pages/UsersPage.tsx
  pages/RolesPage.tsx
  pages/ProfilePage.tsx
  components/UserFormDialog.tsx
  components/RoleFormDialog.tsx
  hooks/useUsuarios.ts
  hooks/useRoles.ts
  services/usuarios.service.ts
  services/roles.service.ts
  types/settings.types.ts
```

Rutas: `/settings/users`, `/settings/roles`, `/settings/profile`

Nav: seccion **Configuracion** visible segun permisos o flag gestor.

## Orden de implementacion

1. Migracion BD + flag en auth/JWT
2. PUT `/auth/perfil`
3. Servicios y pantallas frontend
4. Nav y documentacion

## Fuera de alcance

- CRUD de permisos individuales (catalogo fijo por seed)
- Revocacion de tokens / sesiones
