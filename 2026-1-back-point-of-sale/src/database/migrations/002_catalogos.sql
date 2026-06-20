-- =============================================================================
-- MIGRACIÓN 002: Catálogos — Categorías y Ubicaciones
-- Requiere: 001_seguridad.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MC_CATEGORIA
-- Categorías opcionales para productos/servicios
-- -----------------------------------------------------------------------------
CREATE TABLE MC_CATEGORIA (
  id_categoria       INT IDENTITY(1,1)  NOT NULL,
  nombre_categoria   NVARCHAR(150)      NOT NULL,
  descripcion        NVARCHAR(300)      NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MC_CATEGORIA PRIMARY KEY (id_categoria)
);
GO

-- -----------------------------------------------------------------------------
-- MC_UBICACION
-- Sucursales / bodegas donde se controla inventario
-- -----------------------------------------------------------------------------
CREATE TABLE MC_UBICACION (
  id_ubicacion       INT IDENTITY(1,1)  NOT NULL,
  nombre_ubicacion   NVARCHAR(150)      NOT NULL,
  descripcion        NVARCHAR(300)      NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MC_UBICACION PRIMARY KEY (id_ubicacion)
);
GO

PRINT 'Migración 002 (Catálogos) aplicada correctamente.';
GO
