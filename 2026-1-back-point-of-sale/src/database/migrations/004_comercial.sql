-- =============================================================================
-- MIGRACIÓN 004: Comercial — Clientes, Ventas y Detalle
-- Requiere: 001_seguridad.sql, 002_catalogos.sql, 003_productos_inventario.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MR_CLIENTE
-- Datos del cliente para la venta.
-- nit: Número de Identificación Tributaria (nullable; consumidor final no lo tiene).
-- es_consumidor_final: cliente genérico predeterminado del sistema.
-- -----------------------------------------------------------------------------
CREATE TABLE MR_CLIENTE (
  id_cliente          INT IDENTITY(1,1)  NOT NULL,
  nombre_cliente      NVARCHAR(200)      NOT NULL,
  nit                 NVARCHAR(50)       NULL,
  direccion           NVARCHAR(300)      NULL,
  telefono            NVARCHAR(50)       NULL,
  email               NVARCHAR(200)      NULL,
  es_consumidor_final BIT                NOT NULL  DEFAULT 0,
  activo              BIT                NOT NULL  DEFAULT 1,
  -- Auditoría
  borrado             BIT                NOT NULL  DEFAULT 0,
  usuario_borrado     NVARCHAR(200)      NULL,
  fecha_borrado       DATETIME2          NULL,
  usuario_ingreso     NVARCHAR(200)      NOT NULL,
  fecha_ingreso       DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza   NVARCHAR(200)      NULL,
  fecha_actualiza     DATETIME2          NULL,

  CONSTRAINT PK_MR_CLIENTE PRIMARY KEY (id_cliente)
);
GO

-- -----------------------------------------------------------------------------
-- MR_VENTA
-- Cabecera de cada transacción de venta.
-- numero_venta: correlativo generado por la aplicación (ej. "V-0001").
-- estado: COMPLETADA | ANULADA
-- descuento_total: suma de descuentos aplicados (0 cuando no hay descuento).
-- -----------------------------------------------------------------------------
CREATE TABLE MR_VENTA (
  id_venta            INT IDENTITY(1,1)  NOT NULL,
  numero_venta        NVARCHAR(20)       NOT NULL,
  id_cliente          INT                NOT NULL,
  id_ubicacion        INT                NOT NULL,
  id_usuario          INT                NOT NULL,
  fecha_venta         DATETIME2          NOT NULL  DEFAULT GETDATE(),
  subtotal            DECIMAL(18,2)      NOT NULL,
  descuento_total     DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  impuesto_total      DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  total               DECIMAL(18,2)      NOT NULL,
  estado              NVARCHAR(20)       NOT NULL  DEFAULT 'COMPLETADA',
  observaciones       NVARCHAR(500)      NULL,
  -- Auditoría
  borrado             BIT                NOT NULL  DEFAULT 0,
  usuario_borrado     NVARCHAR(200)      NULL,
  fecha_borrado       DATETIME2          NULL,
  usuario_ingreso     NVARCHAR(200)      NOT NULL,
  fecha_ingreso       DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza   NVARCHAR(200)      NULL,
  fecha_actualiza     DATETIME2          NULL,

  CONSTRAINT PK_MR_VENTA            PRIMARY KEY (id_venta),
  CONSTRAINT FK_VENTA_CLIENTE        FOREIGN KEY (id_cliente)   REFERENCES MR_CLIENTE(id_cliente),
  CONSTRAINT FK_VENTA_UBICACION      FOREIGN KEY (id_ubicacion) REFERENCES MC_UBICACION(id_ubicacion),
  CONSTRAINT FK_VENTA_USUARIO        FOREIGN KEY (id_usuario)   REFERENCES MR_USUARIO(id_usuario),
  CONSTRAINT UQ_VENTA_NUMERO_UBIC    UNIQUE (numero_venta, id_ubicacion),
  CONSTRAINT CHK_VENTA_SUBTOTAL      CHECK (subtotal >= 0),
  CONSTRAINT CHK_VENTA_TOTAL         CHECK (total >= 0),
  CONSTRAINT CHK_VENTA_DESCUENTO     CHECK (descuento_total >= 0),
  CONSTRAINT CHK_VENTA_ESTADO        CHECK (estado IN ('COMPLETADA','ANULADA'))
);
GO

-- -----------------------------------------------------------------------------
-- MR_VENTA_DETALLE
-- Líneas de producto/servicio dentro de una venta.
-- descuento_linea: descuento monetario aplicado a esa línea específica.
-- total_linea = (precio_unitario * cantidad) - descuento_linea
-- -----------------------------------------------------------------------------
CREATE TABLE MR_VENTA_DETALLE (
  id_venta_detalle    INT IDENTITY(1,1)  NOT NULL,
  id_venta            INT                NOT NULL,
  id_producto         INT                NOT NULL,
  cantidad            DECIMAL(18,2)      NOT NULL,
  precio_unitario     DECIMAL(18,2)      NOT NULL,
  descuento_linea     DECIMAL(18,2)      NOT NULL  DEFAULT 0,
  subtotal_linea      DECIMAL(18,2)      NOT NULL,    -- precio_unitario * cantidad
  total_linea         DECIMAL(18,2)      NOT NULL,    -- subtotal_linea - descuento_linea
  -- Auditoría
  borrado             BIT                NOT NULL  DEFAULT 0,
  usuario_borrado     NVARCHAR(200)      NULL,
  fecha_borrado       DATETIME2          NULL,
  usuario_ingreso     NVARCHAR(200)      NOT NULL,
  fecha_ingreso       DATETIME2          NOT NULL  DEFAULT GETDATE(),
  usuario_actualiza   NVARCHAR(200)      NULL,
  fecha_actualiza     DATETIME2          NULL,

  CONSTRAINT PK_MR_VENTA_DET          PRIMARY KEY (id_venta_detalle),
  CONSTRAINT FK_VENTADET_VENTA        FOREIGN KEY (id_venta)    REFERENCES MR_VENTA(id_venta),
  CONSTRAINT FK_VENTADET_PRODUCTO     FOREIGN KEY (id_producto) REFERENCES MR_PRODUCTO(id_producto),
  CONSTRAINT CHK_VENTADET_CANTIDAD    CHECK (cantidad > 0),
  CONSTRAINT CHK_VENTADET_PRECIO      CHECK (precio_unitario >= 0),
  CONSTRAINT CHK_VENTADET_DESCUENTO   CHECK (descuento_linea >= 0),
  CONSTRAINT CHK_VENTADET_TOTAL       CHECK (total_linea >= 0)
);
GO

PRINT 'Migración 004 (Comercial) aplicada correctamente.';
GO
