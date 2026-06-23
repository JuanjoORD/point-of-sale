-- =============================================================================
-- MIGRACION 008: Ubicaciones de almacenamiento fisico (estanteria, fila, caja)
-- Requiere: 003_productos_inventario.sql
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'MC_UBICACION_ALMACENAMIENTO')
BEGIN
  CREATE TABLE MC_UBICACION_ALMACENAMIENTO (
    id_ubicacion_almacenamiento INT IDENTITY(1,1)  NOT NULL,
    estanteria                  NVARCHAR(50)       NOT NULL,
    fila                        NVARCHAR(50)       NULL,
    caja                        NVARCHAR(50)       NULL,
    descripcion                 NVARCHAR(300)      NULL,
    -- Auditoria
    borrado                     BIT                NOT NULL  DEFAULT 0,
    usuario_borrado             NVARCHAR(200)      NULL,
    fecha_borrado               DATETIME2          NULL,
    usuario_ingreso             NVARCHAR(200)      NOT NULL,
    fecha_ingreso               DATETIME2          NOT NULL  DEFAULT GETDATE(),
    usuario_actualiza           NVARCHAR(200)      NULL,
    fecha_actualiza             DATETIME2          NULL,

    CONSTRAINT PK_MC_UBICACION_ALMACENAMIENTO PRIMARY KEY (id_ubicacion_almacenamiento)
  );
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('MR_PRODUCTO') AND name = 'id_ubicacion_almacenamiento'
)
BEGIN
  ALTER TABLE MR_PRODUCTO
    ADD id_ubicacion_almacenamiento INT NULL;

  ALTER TABLE MR_PRODUCTO
    ADD CONSTRAINT FK_PRODUCTO_UBIC_ALMACENAMIENTO
      FOREIGN KEY (id_ubicacion_almacenamiento)
      REFERENCES MC_UBICACION_ALMACENAMIENTO (id_ubicacion_almacenamiento);
END
GO

PRINT 'Migracion 008 (ubicacion almacenamiento) aplicada.';
GO
