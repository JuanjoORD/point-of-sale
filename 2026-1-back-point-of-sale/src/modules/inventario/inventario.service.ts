import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface InventarioItem {
  id_inventario_ubicacion: number;
  id_producto: number;
  nombre_producto: string;
  codigo_barras: string | null;
  es_servicio: boolean;
  id_ubicacion: number;
  nombre_ubicacion: string;
  cantidad_actual: number;
  stock_minimo: number;
  bajo_stock: boolean;
  usuario_ingreso: string;
  fecha_ingreso: Date;
  usuario_actualiza: string | null;
  fecha_actualiza: Date | null;
}

export interface AlertaStock {
  id_alerta_stock: number;
  id_producto: number;
  nombre_producto: string;
  id_ubicacion: number;
  nombre_ubicacion: string;
  tipo_alerta: 'BAJO_STOCK' | 'SIN_STOCK';
  cantidad_al_alertar: number;
  stock_minimo_al_alertar: number;
  estado: 'ACTIVA' | 'RESUELTA' | 'IGNORADA';
  fecha_ingreso: Date;
  fecha_resolucion: Date | null;
}

export interface CreateInventarioDto {
  id_producto: number;
  id_ubicacion: number;
  cantidad_actual?: number;
  stock_minimo?: number;
  observacion?: string;
  usuario: string;
}

export interface UpdateInventarioDto {
  cantidad_actual?: number;
  stock_minimo?: number;
  tipo_movimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad?: number;
  observacion?: string;
  usuario: string;
}

type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

const BASE_SELECT = `
  i.id_inventario_ubicacion,
  i.id_producto,
  p.nombre_producto,
  p.codigo_barras,
  p.es_servicio,
  i.id_ubicacion,
  u.nombre_ubicacion,
  i.cantidad_actual,
  i.stock_minimo,
  CASE WHEN i.cantidad_actual <= i.stock_minimo THEN 1 ELSE 0 END AS bajo_stock,
  i.usuario_ingreso,
  i.fecha_ingreso,
  i.usuario_actualiza,
  i.fecha_actualiza
`;

const mapInventarioRow = (row: InventarioItem & { bajo_stock: number | boolean }): InventarioItem => ({
  ...row,
  bajo_stock: Boolean(row.bajo_stock),
  es_servicio: Boolean(row.es_servicio),
});

const findInventarioRow = async (
  id: number,
  transaction?: Transaction,
): Promise<InventarioItem & { borrado?: number }> => {
  const rows = await sequelize.query<InventarioItem & { bajo_stock: number | boolean }>(
    `SELECT ${BASE_SELECT}
     FROM MR_INVENTARIO_UBICACION i
     INNER JOIN MR_PRODUCTO p ON p.id_producto = i.id_producto AND p.borrado = 0
     INNER JOIN MC_UBICACION u ON u.id_ubicacion = i.id_ubicacion AND u.borrado = 0
     WHERE i.id_inventario_ubicacion = :id AND i.borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT, transaction },
  );
  if (!rows[0]) throw new NotFoundError('Registro de inventario');
  return mapInventarioRow(rows[0]);
};

const assertProductoUbicacion = async (
  id_producto: number,
  id_ubicacion: number,
  transaction?: Transaction,
): Promise<void> => {
  const [producto, ubicacion] = await Promise.all([
    sequelize.query<{ id_producto: number; es_servicio: number }>(
      `SELECT id_producto, es_servicio FROM MR_PRODUCTO
       WHERE id_producto = :id AND borrado = 0 AND activo = 1`,
      { replacements: { id: id_producto }, type: QueryTypes.SELECT, transaction },
    ),
    sequelize.query<{ id_ubicacion: number }>(
      `SELECT id_ubicacion FROM MC_UBICACION
       WHERE id_ubicacion = :id AND borrado = 0 AND activo = 1`,
      { replacements: { id: id_ubicacion }, type: QueryTypes.SELECT, transaction },
    ),
  ]);

  if (!producto[0]) throw new NotFoundError('Producto');
  if (!ubicacion[0]) throw new NotFoundError('Ubicación');
  if (producto[0].es_servicio === 1) {
    throw new ValidationError('Los servicios no registran inventario por ubicación');
  }
};

const registrarMovimiento = async (
  transaction: Transaction,
  params: {
    id_producto: number;
    id_ubicacion: number;
    tipo_movimiento: TipoMovimiento | 'VENTA';
    cantidad: number;
    cantidad_anterior: number;
    cantidad_posterior: number;
    id_referencia?: number;
    observacion?: string;
    usuario: string;
  },
): Promise<void> => {
  await sequelize.query(
    `INSERT INTO MR_MOVIMIENTO_INVENTARIO
       (id_producto, id_ubicacion, tipo_movimiento, cantidad,
        cantidad_anterior, cantidad_posterior, id_referencia, observacion, usuario_ingreso)
     VALUES (:id_producto, :id_ubicacion, :tipo, :cantidad,
             :anterior, :posterior, :referencia, :obs, :usuario)`,
    {
      replacements: {
        id_producto: params.id_producto,
        id_ubicacion: params.id_ubicacion,
        tipo: params.tipo_movimiento,
        cantidad: params.cantidad,
        anterior: params.cantidad_anterior,
        posterior: params.cantidad_posterior,
        referencia: params.id_referencia ?? null,
        obs: params.observacion ?? null,
        usuario: params.usuario,
      },
      type: QueryTypes.INSERT,
      transaction,
    },
  );
};

/** Descuenta stock por venta dentro de una transacción existente. */
export const descontarPorVenta = async (
  transaction: Transaction,
  params: {
    id_producto: number;
    id_ubicacion: number;
    cantidad: number;
    id_venta: number;
    usuario: string;
  },
): Promise<void> => {
  const rows = await sequelize.query<{
    cantidad_actual: number;
    stock_minimo: number;
  }>(
    `SELECT cantidad_actual, stock_minimo
     FROM MR_INVENTARIO_UBICACION
     WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion AND borrado = 0`,
    {
      replacements: {
        id_producto: params.id_producto,
        id_ubicacion: params.id_ubicacion,
      },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  const inv = rows[0];
  if (!inv) {
    throw new ValidationError(
      `No hay inventario registrado para el producto ${params.id_producto} en la ubicación indicada`,
    );
  }

  const anterior = Number(inv.cantidad_actual);
  const stockMinimo = Number(inv.stock_minimo);
  if (anterior < params.cantidad) {
    throw new ValidationError(
      `Stock insuficiente para el producto ${params.id_producto}. Disponible: ${anterior}`,
    );
  }

  const posterior = anterior - params.cantidad;

  await sequelize.query(
    `UPDATE MR_INVENTARIO_UBICACION SET
       cantidad_actual = :posterior,
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion AND borrado = 0`,
    {
      replacements: {
        posterior,
        usuario: params.usuario,
        id_producto: params.id_producto,
        id_ubicacion: params.id_ubicacion,
      },
      type: QueryTypes.UPDATE,
      transaction,
    },
  );

  await registrarMovimiento(transaction, {
    id_producto: params.id_producto,
    id_ubicacion: params.id_ubicacion,
    tipo_movimiento: 'VENTA',
    cantidad: params.cantidad,
    cantidad_anterior: anterior,
    cantidad_posterior: posterior,
    id_referencia: params.id_venta,
    observacion: `Venta ${params.id_venta}`,
    usuario: params.usuario,
  });

  await syncAlertas(transaction, {
    id_producto: params.id_producto,
    id_ubicacion: params.id_ubicacion,
    cantidad: posterior,
    stock_minimo: stockMinimo,
    usuario: params.usuario,
  });
};

const syncAlertas = async (
  transaction: Transaction,
  params: {
    id_producto: number;
    id_ubicacion: number;
    cantidad: number;
    stock_minimo: number;
    usuario: string;
  },
): Promise<void> => {
  const { id_producto, id_ubicacion, cantidad, stock_minimo, usuario } = params;
  const needsAlert = cantidad <= stock_minimo;
  const tipo_alerta = cantidad === 0 ? 'SIN_STOCK' : 'BAJO_STOCK';

  if (needsAlert) {
    const existing = await sequelize.query<{ id_alerta_stock: number }>(
      `SELECT id_alerta_stock FROM MR_ALERTA_STOCK
       WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion
         AND estado = 'ACTIVA' AND borrado = 0`,
      {
        replacements: { id_producto, id_ubicacion },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    if (existing[0]) {
      await sequelize.query(
        `UPDATE MR_ALERTA_STOCK SET
           tipo_alerta = :tipo,
           cantidad_al_alertar = :cantidad,
           stock_minimo_al_alertar = :stock_minimo,
           usuario_actualiza = :usuario,
           fecha_actualiza = GETDATE()
         WHERE id_alerta_stock = :id`,
        {
          replacements: {
            id: existing[0].id_alerta_stock,
            tipo: tipo_alerta,
            cantidad,
            stock_minimo,
            usuario,
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );
    } else {
      await sequelize.query(
        `INSERT INTO MR_ALERTA_STOCK
           (id_producto, id_ubicacion, tipo_alerta, cantidad_al_alertar,
            stock_minimo_al_alertar, estado, usuario_ingreso)
         VALUES (:id_producto, :id_ubicacion, :tipo, :cantidad, :stock_minimo, 'ACTIVA', :usuario)`,
        {
          replacements: {
            id_producto,
            id_ubicacion,
            tipo: tipo_alerta,
            cantidad,
            stock_minimo,
            usuario,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }
    return;
  }

  await sequelize.query(
    `UPDATE MR_ALERTA_STOCK SET
       estado = 'RESUELTA',
       fecha_resolucion = GETDATE(),
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion
       AND estado = 'ACTIVA' AND borrado = 0`,
    {
      replacements: { id_producto, id_ubicacion, usuario },
      type: QueryTypes.UPDATE,
      transaction,
    },
  );
};

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  filters: {
    id_producto?: number;
    id_ubicacion?: number;
    solo_bajo_stock?: boolean;
  },
): Promise<PaginatedResult<InventarioItem>> => {
  const conditions = ['i.borrado = 0', 'p.borrado = 0', 'u.borrado = 0'];
  const replacements: Record<string, unknown> = { offset, limit };

  if (filters.id_producto) {
    conditions.push('i.id_producto = :id_producto');
    replacements.id_producto = filters.id_producto;
  }
  if (filters.id_ubicacion) {
    conditions.push('i.id_ubicacion = :id_ubicacion');
    replacements.id_ubicacion = filters.id_ubicacion;
  }
  if (filters.solo_bajo_stock) {
    conditions.push('i.cantidad_actual <= i.stock_minimo');
  }

  const where = conditions.join(' AND ');

  const [rows, countRows] = await Promise.all([
    sequelize.query<InventarioItem & { bajo_stock: number | boolean }>(
      `SELECT ${BASE_SELECT}
       FROM MR_INVENTARIO_UBICACION i
       INNER JOIN MR_PRODUCTO p ON p.id_producto = i.id_producto
       INNER JOIN MC_UBICACION u ON u.id_ubicacion = i.id_ubicacion
       WHERE ${where}
       ORDER BY u.nombre_ubicacion, p.nombre_producto
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM MR_INVENTARIO_UBICACION i
       INNER JOIN MR_PRODUCTO p ON p.id_producto = i.id_producto
       INNER JOIN MC_UBICACION u ON u.id_ubicacion = i.id_ubicacion
       WHERE ${where}`,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  return {
    data: rows.map(mapInventarioRow),
    total: countRows[0]?.total ?? 0,
    page,
    limit,
  };
};

export const findById = async (id: number): Promise<InventarioItem> => {
  return findInventarioRow(id);
};

export const findAlertas = async (
  page: number,
  limit: number,
  offset: number,
  soloActivas = true,
): Promise<PaginatedResult<AlertaStock>> => {
  const estadoFilter = soloActivas ? "AND a.estado = 'ACTIVA'" : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<AlertaStock>(
      `SELECT
         a.id_alerta_stock,
         a.id_producto,
         p.nombre_producto,
         a.id_ubicacion,
         u.nombre_ubicacion,
         a.tipo_alerta,
         a.cantidad_al_alertar,
         a.stock_minimo_al_alertar,
         a.estado,
         a.fecha_ingreso,
         a.fecha_resolucion
       FROM MR_ALERTA_STOCK a
       INNER JOIN MR_PRODUCTO p ON p.id_producto = a.id_producto AND p.borrado = 0
       INNER JOIN MC_UBICACION u ON u.id_ubicacion = a.id_ubicacion AND u.borrado = 0
       WHERE a.borrado = 0 ${estadoFilter}
       ORDER BY a.fecha_ingreso DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { replacements: { offset, limit }, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM MR_ALERTA_STOCK a
       WHERE a.borrado = 0 ${estadoFilter}`,
      { replacements: {}, type: QueryTypes.SELECT },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const create = async (dto: CreateInventarioDto): Promise<InventarioItem> => {
  const cantidadInicial = dto.cantidad_actual ?? 0;
  const stockMinimo = dto.stock_minimo ?? 0;

  if (cantidadInicial < 0 || stockMinimo < 0) {
    throw new ValidationError('cantidad_actual y stock_minimo deben ser mayores o iguales a 0');
  }

  return sequelize.transaction(async (transaction) => {
    await assertProductoUbicacion(dto.id_producto, dto.id_ubicacion, transaction);

    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_INVENTARIO_UBICACION
       WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion AND borrado = 0`,
      {
        replacements: { id_producto: dto.id_producto, id_ubicacion: dto.id_ubicacion },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    if ((exists[0]?.total ?? 0) > 0) {
      throw new ConflictError('Ya existe inventario para ese producto en la ubicación indicada');
    }

    const result = await sequelize.query<{ id_inventario_ubicacion: number }>(
      `INSERT INTO MR_INVENTARIO_UBICACION
         (id_producto, id_ubicacion, cantidad_actual, stock_minimo, usuario_ingreso)
       OUTPUT INSERTED.id_inventario_ubicacion
       VALUES (:id_producto, :id_ubicacion, :cantidad, :stock_minimo, :usuario)`,
      {
        replacements: {
          id_producto: dto.id_producto,
          id_ubicacion: dto.id_ubicacion,
          cantidad: cantidadInicial,
          stock_minimo: stockMinimo,
          usuario: dto.usuario,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    const id = result[0]?.id_inventario_ubicacion;
    if (!id) throw new Error('No se pudo crear el registro de inventario');

    if (cantidadInicial > 0) {
      await registrarMovimiento(transaction, {
        id_producto: dto.id_producto,
        id_ubicacion: dto.id_ubicacion,
        tipo_movimiento: 'ENTRADA',
        cantidad: cantidadInicial,
        cantidad_anterior: 0,
        cantidad_posterior: cantidadInicial,
        observacion: dto.observacion ?? 'Stock inicial',
        usuario: dto.usuario,
      });
    }

    await syncAlertas(transaction, {
      id_producto: dto.id_producto,
      id_ubicacion: dto.id_ubicacion,
      cantidad: cantidadInicial,
      stock_minimo: stockMinimo,
      usuario: dto.usuario,
    });

    return findInventarioRow(id, transaction);
  });
};

const resolveCantidad = (
  actual: number,
  dto: UpdateInventarioDto,
): { nuevaCantidad: number; tipo: TipoMovimiento; delta: number } => {
  const hasMovimiento = dto.tipo_movimiento !== undefined && dto.cantidad !== undefined;
  const hasCantidadDirecta = dto.cantidad_actual !== undefined;

  if (hasMovimiento && hasCantidadDirecta) {
    throw new ValidationError('Use cantidad_actual o tipo_movimiento+cantidad, no ambos');
  }
  if (!hasMovimiento && !hasCantidadDirecta && dto.stock_minimo === undefined) {
    throw new ValidationError('Debe indicar cantidad_actual o tipo_movimiento+cantidad o stock_minimo');
  }

  if (hasMovimiento) {
    const cantidad = dto.cantidad!;
    if (cantidad <= 0) throw new ValidationError('La cantidad del movimiento debe ser mayor a 0');

    switch (dto.tipo_movimiento) {
      case 'ENTRADA':
        return { nuevaCantidad: actual + cantidad, tipo: 'ENTRADA', delta: cantidad };
      case 'SALIDA':
        if (actual - cantidad < 0) {
          throw new ValidationError('Stock insuficiente para la salida solicitada');
        }
        return { nuevaCantidad: actual - cantidad, tipo: 'SALIDA', delta: cantidad };
      case 'AJUSTE':
        return { nuevaCantidad: cantidad, tipo: 'AJUSTE', delta: Math.abs(cantidad - actual) };
      default:
        throw new ValidationError('tipo_movimiento inválido');
    }
  }

  if (hasCantidadDirecta) {
    const nueva = dto.cantidad_actual!;
    if (nueva < 0) throw new ValidationError('cantidad_actual no puede ser negativa');
    return { nuevaCantidad: nueva, tipo: 'AJUSTE', delta: Math.abs(nueva - actual) };
  }

  return { nuevaCantidad: actual, tipo: 'AJUSTE', delta: 0 };
};

export const update = async (id: number, dto: UpdateInventarioDto): Promise<InventarioItem> => {
  return sequelize.transaction(async (transaction) => {
    const current = await findInventarioRow(id, transaction);
    const stockMinimo = dto.stock_minimo ?? current.stock_minimo;

    if (stockMinimo < 0) {
      throw new ValidationError('stock_minimo no puede ser negativo');
    }

    const { nuevaCantidad, tipo, delta } = resolveCantidad(current.cantidad_actual, dto);
    const cantidadCambio = nuevaCantidad !== current.cantidad_actual;

    await sequelize.query(
      `UPDATE MR_INVENTARIO_UBICACION SET
         cantidad_actual   = :cantidad,
         stock_minimo      = :stock_minimo,
         usuario_actualiza = :usuario,
         fecha_actualiza   = GETDATE()
       WHERE id_inventario_ubicacion = :id AND borrado = 0`,
      {
        replacements: {
          cantidad: nuevaCantidad,
          stock_minimo: stockMinimo,
          usuario: dto.usuario,
          id,
        },
        type: QueryTypes.UPDATE,
        transaction,
      },
    );

    if (cantidadCambio && delta > 0) {
      await registrarMovimiento(transaction, {
        id_producto: current.id_producto,
        id_ubicacion: current.id_ubicacion,
        tipo_movimiento: tipo,
        cantidad: delta,
        cantidad_anterior: current.cantidad_actual,
        cantidad_posterior: nuevaCantidad,
        observacion: dto.observacion,
        usuario: dto.usuario,
      });
    }

    await syncAlertas(transaction, {
      id_producto: current.id_producto,
      id_ubicacion: current.id_ubicacion,
      cantidad: nuevaCantidad,
      stock_minimo: stockMinimo,
      usuario: dto.usuario,
    });

    return findInventarioRow(id, transaction);
  });
};
