-- =============================================================================
-- MIGRACIÓN 003: Productos e Inventario
-- Requiere: 001_seguridad.sql, 002_catalogos.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MR_PRODUCTO
-- Productos físicos y servicios del catálogo de venta.
-- es_servicio = 1 → no descuenta inventario al vender.
-- id_categoria es nullable (categoría opcional según requerimiento).
-- codigo_barras es nullable y único (solo cuando se asigna).
-- -----------------------------------------------------------------------------
CREATE TABLE MR_PRODUCTO (
  id_producto        INT IDENTITY(1,1)  NOT NULL,
  nombre_producto    NVARCHAR(200)      NOT NULL,
  descripcion        NVARCHAR(500)      NULL,
  codigo_barras      NVARCHAR(100)      NULL,
  precio_costo       DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  precio_venta       DECIMAL(18,2)      NOT NULL,
  es_servicio        BIT                NOT NULL  DEFAULT 0,
  id_categoria       INT                NULL,                   -- opcional
  activo             BIT                NOT NULL  DEFAULT 1,
  -- Auditoría
  borrado            BIT                NOT NULL  DEFAULT 0,
  usuario_borrado    NVARCHAR(200)      NULL,
  fecha_borrado      DATETIME2          NULL,
  usuario_ingreso    NVARCHAR(200)      NOT NULL,
  fecha_ingreso      DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza  NVARCHAR(200)      NULL,
  fecha_actualiza    DATETIME2          NULL,

  CONSTRAINT PK_MR_PRODUCTO           PRIMARY KEY (id_producto),
  CONSTRAINT FK_PRODUCTO_CATEGORIA    FOREIGN KEY (id_categoria) REFERENCES MC_CATEGORIA(id_categoria),
  CONSTRAINT CHK_PRODUCTO_PRECIO_VENTA CHECK (precio_venta >= 0),
  CONSTRAINT CHK_PRODUCTO_PRECIO_COSTO CHECK (precio_costo >= 0)
);
GO

-- -----------------------------------------------------------------------------
-- MR_INVENTARIO_UBICACION
-- Stock actual de un producto en una ubicación específica.
-- Una combinación producto+ubicacion es única.
-- Los servicios (es_servicio=1) normalmente no tienen registro aquí,
-- pero no se restringe a nivel de BD para máxima flexibilidad.
-- -----------------------------------------------------------------------------
CREATE TABLE MR_INVENTARIO_UBICACION (
  id_inventario_ubicacion INT IDENTITY(1,1)  NOT NULL,
  id_producto             INT                NOT NULL,
  id_ubicacion            INT                NOT NULL,
  cantidad_actual         DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  stock_minimo            DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  -- Auditoría
  borrado                 BIT                NOT NULL  DEFAULT 0,
  usuario_borrado         NVARCHAR(200)      NULL,
  fecha_borrado           DATETIME2          NULL,
  usuario_ingreso         NVARCHAR(200)      NOT NULL,
  fecha_ingreso           DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza       NVARCHAR(200)      NULL,
  fecha_actualiza         DATETIME2          NULL,

  CONSTRAINT PK_MR_INV_UBIC              PRIMARY KEY (id_inventario_ubicacion),
  CONSTRAINT FK_INV_UBIC_PRODUCTO        FOREIGN KEY (id_producto)  REFERENCES MR_PRODUCTO(id_producto),
  CONSTRAINT FK_INV_UBIC_UBICACION       FOREIGN KEY (id_ubicacion) REFERENCES MC_UBICACION(id_ubicacion),
  CONSTRAINT UQ_INV_UBIC_PROD_UBIC       UNIQUE (id_producto, id_ubicacion),
  CONSTRAINT CHK_INV_UBIC_CANTIDAD       CHECK (cantidad_actual >= 0),
  CONSTRAINT CHK_INV_UBIC_STOCK_MIN      CHECK (stock_minimo >= 0)
);
GO

-- -----------------------------------------------------------------------------
-- MR_MOVIMIENTO_INVENTARIO
-- Trazabilidad de cada cambio de stock (entrada, salida, ajuste, venta).
-- tipo_movimiento: ENTRADA | SALIDA | AJUSTE | VENTA
-- id_referencia: id_venta cuando tipo = VENTA (nullable en otros casos).
-- -----------------------------------------------------------------------------
CREATE TABLE MR_MOVIMIENTO_INVENTARIO (
  id_movimiento_inventario INT IDENTITY(1,1)  NOT NULL,
  id_producto              INT                NOT NULL,
  id_ubicacion             INT                NOT NULL,
  tipo_movimiento          NVARCHAR(20)       NOT NULL,
  cantidad                 DECIMAL(18,2)      NOT NULL,
  cantidad_anterior        DECIMAL(18,2)      NOT NULL,
  cantidad_posterior       DECIMAL(18,2)      NOT NULL,
  id_referencia            INT                NULL,   -- id_venta u otro origen
  observacion              NVARCHAR(500)      NULL,
  -- Auditoría
  borrado                  BIT                NOT NULL  DEFAULT 0,
  usuario_borrado          NVARCHAR(200)      NULL,
  fecha_borrado            DATETIME2          NULL,
  usuario_ingreso          NVARCHAR(200)      NOT NULL,
  fecha_ingreso            DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza        NVARCHAR(200)      NULL,
  fecha_actualiza          DATETIME2          NULL,

  CONSTRAINT PK_MR_MOV_INV          PRIMARY KEY (id_movimiento_inventario),
  CONSTRAINT FK_MOV_INV_PRODUCTO    FOREIGN KEY (id_producto)  REFERENCES MR_PRODUCTO(id_producto),
  CONSTRAINT FK_MOV_INV_UBICACION   FOREIGN KEY (id_ubicacion) REFERENCES MC_UBICACION(id_ubicacion),
  CONSTRAINT CHK_MOV_INV_TIPO       CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE','VENTA')),
  CONSTRAINT CHK_MOV_INV_CANTIDAD   CHECK (cantidad > 0)
);
GO

-- -----------------------------------------------------------------------------
-- MR_ALERTA_STOCK
-- Registro de alertas generadas cuando cantidad_actual <= stock_minimo.
-- tipo_alerta: BAJO_STOCK | SIN_STOCK
-- estado:      ACTIVA | RESUELTA | IGNORADA
-- -----------------------------------------------------------------------------
CREATE TABLE MR_ALERTA_STOCK (
  id_alerta_stock            INT IDENTITY(1,1)  NOT NULL,
  id_producto                INT                NOT NULL,
  id_ubicacion               INT                NOT NULL,
  tipo_alerta                NVARCHAR(20)       NOT NULL,
  cantidad_al_alertar        DECIMAL(18,2)      NOT NULL,
  stock_minimo_al_alertar    DECIMAL(18,2)      NOT NULL,
  estado                     NVARCHAR(20)       NOT NULL  DEFAULT 'ACTIVA',
  fecha_resolucion           DATETIME2          NULL,
  -- Auditoría
  borrado                    BIT                NOT NULL  DEFAULT 0,
  usuario_borrado            NVARCHAR(200)      NULL,
  fecha_borrado              DATETIME2          NULL,
  usuario_ingreso            NVARCHAR(200)      NOT NULL,
  fecha_ingreso              DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza          NVARCHAR(200)      NULL,
  fecha_actualiza            DATETIME2          NULL,

  CONSTRAINT PK_MR_ALERTA_STOCK       PRIMARY KEY (id_alerta_stock),
  CONSTRAINT FK_ALERTA_PRODUCTO       FOREIGN KEY (id_producto)  REFERENCES MR_PRODUCTO(id_producto),
  CONSTRAINT FK_ALERTA_UBICACION      FOREIGN KEY (id_ubicacion) REFERENCES MC_UBICACION(id_ubicacion),
  CONSTRAINT CHK_ALERTA_TIPO          CHECK (tipo_alerta IN ('BAJO_STOCK','SIN_STOCK')),
  CONSTRAINT CHK_ALERTA_ESTADO        CHECK (estado IN ('ACTIVA','RESUELTA','IGNORADA'))
);
GO

PRINT 'Migración 003 (Productos e Inventario) aplicada correctamente.';
GO
