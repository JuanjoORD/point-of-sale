-- =============================================================================
-- SEED 001: Datos iniciales del sistema
-- Requiere: todas las migraciones (001–005)
-- Idempotente: usa IF NOT EXISTS para no duplicar en re-ejecuciones.
-- =============================================================================

-- ── Roles base ────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM MR_ROL WHERE nombre_rol = 'ADMIN' AND borrado = 0)
  INSERT INTO MR_ROL (nombre_rol, descripcion, usuario_ingreso)
  VALUES ('ADMIN', 'Acceso total al sistema', 'SYSTEM');

IF NOT EXISTS (SELECT 1 FROM MR_ROL WHERE nombre_rol = 'GERENTE' AND borrado = 0)
  INSERT INTO MR_ROL (nombre_rol, descripcion, usuario_ingreso)
  VALUES ('GERENTE', 'Gestión de inventario, ventas y reportes', 'SYSTEM');

IF NOT EXISTS (SELECT 1 FROM MR_ROL WHERE nombre_rol = 'VENDEDOR' AND borrado = 0)
  INSERT INTO MR_ROL (nombre_rol, descripcion, usuario_ingreso)
  VALUES ('VENDEDOR', 'Realiza ventas y consulta catálogo', 'SYSTEM');

IF NOT EXISTS (SELECT 1 FROM MR_ROL WHERE nombre_rol = 'ALMACENERO' AND borrado = 0)
  INSERT INTO MR_ROL (nombre_rol, descripcion, usuario_ingreso)
  VALUES ('ALMACENERO', 'Gestión de inventario y ubicaciones', 'SYSTEM');
GO

-- ── Permisos base (formato "recurso:accion") ──────────────────────────────────
DECLARE @permisos TABLE (codigo NVARCHAR(100), descripcion NVARCHAR(300));
INSERT INTO @permisos VALUES
  ('usuarios:leer',      'Ver lista de usuarios'),
  ('usuarios:crear',     'Crear nuevos usuarios'),
  ('usuarios:editar',    'Editar datos de usuarios'),
  ('roles:leer',         'Ver roles'),
  ('roles:crear',        'Crear roles'),
  ('roles:editar',       'Editar permisos de roles'),
  ('productos:leer',     'Ver catálogo de productos'),
  ('productos:crear',    'Crear productos/servicios'),
  ('productos:editar',   'Editar productos/servicios'),
  ('inventario:leer',    'Consultar stock e historial'),
  ('inventario:editar',  'Ajustar stock y ubicaciones'),
  ('clientes:leer',      'Ver clientes'),
  ('clientes:crear',     'Crear clientes'),
  ('clientes:editar',    'Editar datos de clientes'),
  ('ventas:crear',       'Registrar ventas'),
  ('ventas:leer',        'Ver historial de ventas'),
  ('reportes:leer',      'Acceder a reportes y dashboard');

INSERT INTO MR_PERMISO (codigo_permiso, descripcion, usuario_ingreso)
SELECT p.codigo, p.descripcion, 'SYSTEM'
FROM @permisos p
WHERE NOT EXISTS (
  SELECT 1 FROM MR_PERMISO mp
  WHERE mp.codigo_permiso = p.codigo AND mp.borrado = 0
);
GO

-- ── Asignar TODOS los permisos al rol ADMIN ────────────────────────────────────
INSERT INTO MR_ROL_PERMISO (id_rol, id_permiso, usuario_ingreso)
SELECT r.id_rol, p.id_permiso, 'SYSTEM'
FROM MR_ROL r
CROSS JOIN MR_PERMISO p
WHERE r.nombre_rol = 'ADMIN'
  AND r.borrado = 0
  AND p.borrado  = 0
  AND NOT EXISTS (
    SELECT 1 FROM MR_ROL_PERMISO rp
    WHERE rp.id_rol = r.id_rol AND rp.id_permiso = p.id_permiso AND rp.borrado = 0
  );
GO

-- ── Permisos del GERENTE ───────────────────────────────────────────────────────
INSERT INTO MR_ROL_PERMISO (id_rol, id_permiso, usuario_ingreso)
SELECT r.id_rol, p.id_permiso, 'SYSTEM'
FROM MR_ROL r
JOIN MR_PERMISO p ON p.codigo_permiso IN (
  'productos:leer','productos:crear','productos:editar',
  'inventario:leer','inventario:editar',
  'clientes:leer','clientes:crear','clientes:editar',
  'ventas:crear','ventas:leer',
  'reportes:leer'
)
WHERE r.nombre_rol = 'GERENTE' AND r.borrado = 0 AND p.borrado = 0
  AND NOT EXISTS (
    SELECT 1 FROM MR_ROL_PERMISO rp
    WHERE rp.id_rol = r.id_rol AND rp.id_permiso = p.id_permiso AND rp.borrado = 0
  );
GO

-- ── Permisos del VENDEDOR ─────────────────────────────────────────────────────
INSERT INTO MR_ROL_PERMISO (id_rol, id_permiso, usuario_ingreso)
SELECT r.id_rol, p.id_permiso, 'SYSTEM'
FROM MR_ROL r
JOIN MR_PERMISO p ON p.codigo_permiso IN (
  'productos:leer',
  'clientes:leer','clientes:crear',
  'ventas:crear','ventas:leer'
)
WHERE r.nombre_rol = 'VENDEDOR' AND r.borrado = 0 AND p.borrado = 0
  AND NOT EXISTS (
    SELECT 1 FROM MR_ROL_PERMISO rp
    WHERE rp.id_rol = r.id_rol AND rp.id_permiso = p.id_permiso AND rp.borrado = 0
  );
GO

-- ── Permisos del ALMACENERO ───────────────────────────────────────────────────
INSERT INTO MR_ROL_PERMISO (id_rol, id_permiso, usuario_ingreso)
SELECT r.id_rol, p.id_permiso, 'SYSTEM'
FROM MR_ROL r
JOIN MR_PERMISO p ON p.codigo_permiso IN (
  'productos:leer','productos:crear','productos:editar',
  'inventario:leer','inventario:editar'
)
WHERE r.nombre_rol = 'ALMACENERO' AND r.borrado = 0 AND p.borrado = 0
  AND NOT EXISTS (
    SELECT 1 FROM MR_ROL_PERMISO rp
    WHERE rp.id_rol = r.id_rol AND rp.id_permiso = p.id_permiso AND rp.borrado = 0
  );
GO

-- ── Ubicación principal ───────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM MC_UBICACION WHERE nombre_ubicacion = 'Principal' AND borrado = 0)
  INSERT INTO MC_UBICACION (nombre_ubicacion, descripcion, usuario_ingreso)
  VALUES ('Principal', 'Ubicación principal del negocio', 'SYSTEM');
GO

-- ── Cliente consumidor final (predeterminado para ventas sin NIT) ──────────────
IF NOT EXISTS (SELECT 1 FROM MR_CLIENTE WHERE es_consumidor_final = 1 AND borrado = 0)
  INSERT INTO MR_CLIENTE (nombre_cliente, es_consumidor_final, activo, usuario_ingreso)
  VALUES ('Consumidor Final', 1, 1, 'SYSTEM');
GO

-- ── Usuario administrador inicial ─────────────────────────────────────────────
-- IMPORTANTE: cambiar la contraseña inmediatamente tras el primer login.
-- El hash corresponde a "Admin1234!" generado con bcrypt (cost=12).
-- Reemplazar este hash con uno generado en el momento de instalación.
IF NOT EXISTS (SELECT 1 FROM MR_USUARIO WHERE email = 'admin@pos.local' AND borrado = 0)
BEGIN
  DECLARE @id_admin INT;
  INSERT INTO MR_USUARIO (nombre, email, hash_contrasena, activo, usuario_ingreso)
  VALUES ('Administrador', 'admin@pos.local',
          '$2b$12$PLACEHOLDER_REEMPLAZAR_CON_HASH_BCRYPT_REAL', 1, 'SYSTEM');
  SET @id_admin = SCOPE_IDENTITY();

  INSERT INTO MR_USUARIO_ROL (id_usuario, id_rol, usuario_ingreso)
  SELECT @id_admin, id_rol, 'SYSTEM'
  FROM MR_ROL WHERE nombre_rol = 'ADMIN' AND borrado = 0;
END
GO

PRINT 'Seed 001 (Datos iniciales) aplicado correctamente.';
GO
