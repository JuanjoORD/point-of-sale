-- =============================================================================
-- MIGRACION 006: Flag es_gestor_seguridad en MR_USUARIO
-- Permite gestionar usuarios/roles sin depender solo de permisos por rol.
-- =============================================================================

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('MR_USUARIO') AND name = 'es_gestor_seguridad'
)
BEGIN
  ALTER TABLE MR_USUARIO
    ADD es_gestor_seguridad BIT NOT NULL
      CONSTRAINT DF_USUARIO_GESTOR_SEG DEFAULT 0;
END
GO

-- Usuario admin del seed
UPDATE MR_USUARIO
SET es_gestor_seguridad = 1,
    usuario_actualiza = 'SYSTEM',
    fecha_actualiza = GETDATE()
WHERE email = 'admin@pos.local' AND borrado = 0;
GO

-- Cualquier usuario con rol ADMIN activo
UPDATE u
SET u.es_gestor_seguridad = 1,
    u.usuario_actualiza = 'SYSTEM',
    u.fecha_actualiza = GETDATE()
FROM MR_USUARIO u
INNER JOIN MR_USUARIO_ROL ur ON ur.id_usuario = u.id_usuario AND ur.borrado = 0
INNER JOIN MR_ROL r ON r.id_rol = ur.id_rol AND r.borrado = 0
WHERE r.nombre_rol = 'ADMIN' AND u.borrado = 0;
GO

PRINT 'Migracion 006 (es_gestor_seguridad) aplicada.';
GO
