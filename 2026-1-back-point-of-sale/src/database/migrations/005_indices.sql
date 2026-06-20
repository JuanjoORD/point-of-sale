-- =============================================================================
-- MIGRACIÓN 005: Índices de rendimiento
-- Requiere: todas las migraciones anteriores
-- Nota: los índices filtrados (WHERE borrado = 0) mejoran rendimiento en
--       consultas del día a día y son compatibles con MSSQL 2012+.
-- =============================================================================

-- ── Seguridad ─────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX UQ_IX_USUARIO_EMAIL
  ON MR_USUARIO(email)
  WHERE borrado = 0;
GO

-- ── Productos ────────────────────────────────────────────────────────────────
-- Búsqueda por nombre (LIKE '%term%' se beneficia de índice parcial)
CREATE INDEX IX_PRODUCTO_NOMBRE
  ON MR_PRODUCTO(nombre_producto)
  WHERE borrado = 0;
GO

-- Búsqueda por código de barras (único solo cuando no es NULL y no está borrado)
CREATE UNIQUE INDEX UQ_IX_PRODUCTO_BARCODE
  ON MR_PRODUCTO(codigo_barras)
  WHERE borrado = 0 AND codigo_barras IS NOT NULL;
GO

-- ── Clientes ──────────────────────────────────────────────────────────────────
-- Búsqueda por NIT
CREATE INDEX IX_CLIENTE_NIT
  ON MR_CLIENTE(nit)
  WHERE borrado = 0 AND nit IS NOT NULL;
GO

-- Búsqueda por nombre
CREATE INDEX IX_CLIENTE_NOMBRE
  ON MR_CLIENTE(nombre_cliente)
  WHERE borrado = 0;
GO

-- ── Ventas ────────────────────────────────────────────────────────────────────
-- Consultas de dashboard y reportes por fecha
CREATE INDEX IX_VENTA_FECHA
  ON MR_VENTA(fecha_venta)
  WHERE borrado = 0;
GO

-- Ventas por ubicación (dashboard multi-sucursal)
CREATE INDEX IX_VENTA_UBICACION_FECHA
  ON MR_VENTA(id_ubicacion, fecha_venta)
  WHERE borrado = 0;
GO

-- Ventas por usuario (historial del vendedor)
CREATE INDEX IX_VENTA_USUARIO
  ON MR_VENTA(id_usuario)
  WHERE borrado = 0;
GO

-- ── Detalle de ventas ─────────────────────────────────────────────────────────
-- Reportes de producto más vendido
CREATE INDEX IX_VENTADET_PRODUCTO
  ON MR_VENTA_DETALLE(id_producto)
  WHERE borrado = 0;
GO

-- Unión rápida con cabecera
CREATE INDEX IX_VENTADET_VENTA
  ON MR_VENTA_DETALLE(id_venta)
  WHERE borrado = 0;
GO

-- ── Inventario ────────────────────────────────────────────────────────────────
-- Consultas de stock por ubicación
CREATE INDEX IX_INV_UBICACION
  ON MR_INVENTARIO_UBICACION(id_ubicacion)
  WHERE borrado = 0;
GO

-- Alertas activas (consulta frecuente en dashboard)
CREATE INDEX IX_ALERTA_STOCK_ESTADO
  ON MR_ALERTA_STOCK(estado, id_ubicacion)
  WHERE borrado = 0;
GO

-- Movimientos por producto (trazabilidad)
CREATE INDEX IX_MOVINV_PRODUCTO_FECHA
  ON MR_MOVIMIENTO_INVENTARIO(id_producto, fecha_ingreso)
  WHERE borrado = 0;
GO

PRINT 'Migración 005 (Índices) aplicada correctamente.';
GO
