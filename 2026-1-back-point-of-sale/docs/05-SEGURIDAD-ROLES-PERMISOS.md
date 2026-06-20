# Seguridad, Roles y Permisos

## Autenticacion
- JWT access token corto.
- JWT refresh token controlado.
- Revocacion de refresh al cerrar sesion.

## Autorizacion
- Control por permiso de accion (RBAC).
- Middleware global: autenticar.
- Middleware por endpoint: autorizar permiso.

## Roles base del MVP
- ADMIN: acceso total.
- GERENTE: inventario, ventas, reportes.
- VENDEDOR: ventas y lectura de catalogos/clientes.
- ALMACENERO: inventario y catalogos.

## Politicas
- Password hash fuerte.
- Rate limit en login.
- Auditoria en operaciones criticas.
- No exponer errores internos al cliente.
- Toda consulta filtra borrado = 0.

## Auditoria
Registrar en audit log:
- usuario
- accion
- recurso
- id_registro
- antes/despues (si aplica)
- fecha
