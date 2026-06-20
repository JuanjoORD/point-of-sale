-- =============================================================================
-- MIGRACIÓN 001: Seguridad — Usuarios, Roles y Permisos
-- Base de datos: pos_inventario (MSSQL)
-- Convención:
--   · Tablas MR_ (registro) o MC_ (catálogo) en MAYÚSCULAS.
--   · Columnas en minúsculas con guion bajo.
--   · PK: id_<entidad> INT IDENTITY.
--   · Campos de auditoría obligatorios en TODAS las tablas.
--   · Solo borrado lógico (borrado BIT, no DELETE físico en flujo normal).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MR_ROL
-- Catálogo de roles del sistema (ADMIN, GERENTE, VENDEDOR, ALMACENERO, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE MR_ROL (
  id_rol             INT IDENTITY(1,1)  NOT NULL,
  nombre_rol         NVARCHAR(100)      NOT NULL,
  descripcion        NVARCHAR(300)      NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_ROL PRIMARY KEY (id_rol),
  CONSTRAINT UQ_ROL_NOMBRE UNIQUE (nombre_rol)
);
GO

-- -----------------------------------------------------------------------------
-- MR_PERMISO
-- Catálogo de permisos en formato "recurso:accion"
-- Ejemplo: "ventas:crear", "reportes:leer", "productos:editar"
-- -----------------------------------------------------------------------------
CREATE TABLE MR_PERMISO (
  id_permiso         INT IDENTITY(1,1)  NOT NULL,
  codigo_permiso     NVARCHAR(100)      NOT NULL,   -- "recurso:accion"
  descripcion        NVARCHAR(300)      NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_PERMISO PRIMARY KEY (id_permiso),
  CONSTRAINT UQ_PERMISO_CODIGO UNIQUE (codigo_permiso)
);
GO

-- -----------------------------------------------------------------------------
-- MR_USUARIO
-- Usuarios del sistema. hash_contrasena almacena bcrypt.
-- -----------------------------------------------------------------------------
CREATE TABLE MR_USUARIO (
  id_usuario         INT IDENTITY(1,1)  NOT NULL,
  nombre             NVARCHAR(150)      NOT NULL,
  email              NVARCHAR(200)      NOT NULL,
  hash_contrasena    NVARCHAR(255)      NOT NULL,
  activo             BIT                NOT NULL  DEFAULT 1,
  ultimo_login       DATETIME2          NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_USUARIO PRIMARY KEY (id_usuario)
);
GO

-- -----------------------------------------------------------------------------
-- MR_USUARIO_ROL
-- Relación muchos-a-muchos Usuario ↔ Rol
-- -----------------------------------------------------------------------------
CREATE TABLE MR_USUARIO_ROL (
  id_usuario_rol     INT IDENTITY(1,1)  NOT NULL,
  id_usuario         INT                NOT NULL,
  id_rol             INT                NOT NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_USUARIO_ROL   PRIMARY KEY (id_usuario_rol),
  CONSTRAINT FK_USRROL_USUARIO   FOREIGN KEY (id_usuario) REFERENCES MR_USUARIO(id_usuario),
  CONSTRAINT FK_USRROL_ROL       FOREIGN KEY (id_rol)     REFERENCES MR_ROL(id_rol),
  CONSTRAINT UQ_USRROL_PAR       UNIQUE (id_usuario, id_rol)
);
GO

-- -----------------------------------------------------------------------------
-- MR_ROL_PERMISO
-- Relación muchos-a-muchos Rol ↔ Permiso
-- -----------------------------------------------------------------------------
CREATE TABLE MR_ROL_PERMISO (
  id_rol_permiso     INT IDENTITY(1,1)  NOT NULL,
  id_rol             INT                NOT NULL,
  id_permiso         INT                NOT NULL,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_ROL_PERMISO   PRIMARY KEY (id_rol_permiso),
  CONSTRAINT FK_ROLPERM_ROL      FOREIGN KEY (id_rol)     REFERENCES MR_ROL(id_rol),
  CONSTRAINT FK_ROLPERM_PERMISO  FOREIGN KEY (id_permiso) REFERENCES MR_PERMISO(id_permiso),
  CONSTRAINT UQ_ROLPERM_PAR      UNIQUE (id_rol, id_permiso)
);
GO

PRINT 'Migración 001 (Seguridad) aplicada correctamente.';
GO
