-- =============================================================================
-- MIGRACION 007: Flag es_usuario_sistema en MR_USUARIO
-- Protege al administrador creado por SYSTEM; solo el propio usuario puede editarlo.
-- No puede eliminarse.
-- =============================================================================

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('MR_USUARIO') AND name = 'es_usuario_sistema'
)
BEGIN
  ALTER TABLE MR_USUARIO
    ADD es_usuario_sistema BIT NOT NULL
      CONSTRAINT DF_USUARIO_SISTEMA DEFAULT 0;
END
GO

-- Usuario inicial del seed (creado por SYSTEM)
UPDATE MR_USUARIO
SET es_usuario_sistema = 1,
    usuario_actualiza = 'SYSTEM',
    fecha_actualiza = GETDATE()
WHERE borrado = 0
  AND (
    usuario_ingreso = 'SYSTEM'
    OR email = 'admin@pos.local'
  );
GO

PRINT 'Migracion 007 (es_usuario_sistema) aplicada.';
GO
