import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';
import { descontarPorVenta } from '../inventario/inventario.service';

export interface VentaDetalleItem {
  id_venta_detalle: number;
  id_producto: number;
  nombre_producto: string;
  es_servicio: boolean;
  cantidad: number;
  precio_unitario: number;
  descuento_linea: number;
  subtotal_linea: number;
  total_linea: number;
}

export interface Venta {
  id_venta: number;
  numero_venta: string;
  id_cliente: number;
  nombre_cliente: string;
  nit: string | null;
  direccion: string | null;
  id_ubicacion: number;
  nombre_ubicacion: string;
  id_usuario: number;
  nombre_usuario: string;
  fecha_venta: Date;
  subtotal: number;
  descuento_total: number;
  impuesto_total: number;
  total: number;
  estado: string;
  observaciones: string | null;
  detalle: VentaDetalleItem[];
}

export interface CreateVentaDetalleDto {
  id_producto: number;
  cantidad: number;
  precio_unitario?: number;
  descuento_linea?: number;
}

export interface CreateVentaDto {
  id_cliente: number;
  id_ubicacion: number;
  descuento_adicional?: number;
  impuesto_total?: number;
  observaciones?: string;
  detalle: CreateVentaDetalleDto[];
  id_usuario: number;
  usuario: string;
}

interface ProductoVentaRow {
  id_producto: number;
  nombre_producto: string;
  precio_venta: number;
  es_servicio: number;
}

interface LineaCalculada {
  id_producto: number;
  nombre_producto: string;
  es_servicio: boolean;
  cantidad: number;
  precio_unitario: number;
  descuento_linea: number;
  subtotal_linea: number;
  total_linea: number;
}

const VENTA_HEADER_SELECT = `
  v.id_venta,
  v.numero_venta,
  v.id_cliente,
  c.nombre_cliente,
  c.nit,
  c.direccion,
  v.id_ubicacion,
  u.nombre_ubicacion,
  v.id_usuario,
  us.nombre AS nombre_usuario,
  v.fecha_venta,
  v.subtotal,
  v.descuento_total,
  v.impuesto_total,
  v.total,
  v.estado,
  v.observaciones
`;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const fetchDetalle = async (
  id_venta: number,
  transaction?: Transaction,
): Promise<VentaDetalleItem[]> => {
  const rows = await sequelize.query<VentaDetalleItem & { es_servicio: number | boolean }>(
    `SELECT
       d.id_venta_detalle,
       d.id_producto,
       p.nombre_producto,
       p.es_servicio,
       d.cantidad,
       d.precio_unitario,
       d.descuento_linea,
       d.subtotal_linea,
       d.total_linea
     FROM MR_VENTA_DETALLE d
     INNER JOIN MR_PRODUCTO p ON p.id_producto = d.id_producto AND p.borrado = 0
     WHERE d.id_venta = :id_venta AND d.borrado = 0
     ORDER BY d.id_venta_detalle`,
    { replacements: { id_venta }, type: QueryTypes.SELECT, transaction },
  );

  return rows.map((row) => ({
    ...row,
    es_servicio: Boolean(row.es_servicio),
  }));
};

const fetchVentaHeader = async (
  id_venta: number,
  transaction?: Transaction,
): Promise<Omit<Venta, 'detalle'>> => {
  const rows = await sequelize.query<Omit<Venta, 'detalle'>>(
    `SELECT ${VENTA_HEADER_SELECT}
     FROM MR_VENTA v
     INNER JOIN MR_CLIENTE c ON c.id_cliente = v.id_cliente AND c.borrado = 0
     INNER JOIN MC_UBICACION u ON u.id_ubicacion = v.id_ubicacion AND u.borrado = 0
     INNER JOIN MR_USUARIO us ON us.id_usuario = v.id_usuario AND us.borrado = 0
     WHERE v.id_venta = :id_venta AND v.borrado = 0`,
    { replacements: { id_venta }, type: QueryTypes.SELECT, transaction },
  );
  if (!rows[0]) throw new NotFoundError('Venta');
  return rows[0];
};

const buildVenta = async (id_venta: number, transaction?: Transaction): Promise<Venta> => {
  const header = await fetchVentaHeader(id_venta, transaction);
  const detalle = await fetchDetalle(id_venta, transaction);
  return { ...header, detalle };
};

const assertCliente = async (id_cliente: number, transaction: Transaction): Promise<void> => {
  const rows = await sequelize.query<{ id_cliente: number }>(
    `SELECT id_cliente FROM MR_CLIENTE
     WHERE id_cliente = :id AND borrado = 0 AND activo = 1`,
    { replacements: { id: id_cliente }, type: QueryTypes.SELECT, transaction },
  );
  if (!rows[0]) throw new NotFoundError('Cliente');
};

const assertUbicacion = async (id_ubicacion: number, transaction: Transaction): Promise<void> => {
  const rows = await sequelize.query<{ id_ubicacion: number }>(
    `SELECT id_ubicacion FROM MC_UBICACION
     WHERE id_ubicacion = :id AND borrado = 0 AND activo = 1`,
    { replacements: { id: id_ubicacion }, type: QueryTypes.SELECT, transaction },
  );
  if (!rows[0]) throw new NotFoundError('Ubicación');
};

const fetchProducto = async (
  id_producto: number,
  transaction: Transaction,
): Promise<ProductoVentaRow> => {
  const rows = await sequelize.query<ProductoVentaRow>(
    `SELECT id_producto, nombre_producto, precio_venta, es_servicio
     FROM MR_PRODUCTO
     WHERE id_producto = :id AND borrado = 0 AND activo = 1`,
    { replacements: { id: id_producto }, type: QueryTypes.SELECT, transaction },
  );
  if (!rows[0]) throw new NotFoundError(`Producto ${id_producto}`);
  return rows[0];
};

const calcularLineas = async (
  detalle: CreateVentaDetalleDto[],
  transaction: Transaction,
): Promise<LineaCalculada[]> => {
  if (!detalle.length) {
    throw new ValidationError('La venta debe incluir al menos un producto');
  }

  const lineas: LineaCalculada[] = [];
  const productosUsados = new Set<number>();

  for (const item of detalle) {
    if (productosUsados.has(item.id_producto)) {
      throw new ValidationError(
        `Producto ${item.id_producto} duplicado en el detalle; consolide la cantidad en una sola línea`,
      );
    }
    productosUsados.add(item.id_producto);

    const producto = await fetchProducto(item.id_producto, transaction);
    const precio = item.precio_unitario ?? Number(producto.precio_venta);
    const descuento = item.descuento_linea ?? 0;

    if (item.cantidad <= 0) {
      throw new ValidationError(`Cantidad inválida para el producto ${item.id_producto}`);
    }
    if (precio < 0) {
      throw new ValidationError(`Precio inválido para el producto ${item.id_producto}`);
    }
    if (descuento < 0) {
      throw new ValidationError(`Descuento inválido para el producto ${item.id_producto}`);
    }

    const subtotal_linea = roundMoney(precio * item.cantidad);
    if (descuento > subtotal_linea) {
      throw new ValidationError(
        `El descuento de línea supera el subtotal del producto ${producto.nombre_producto}`,
      );
    }

    const total_linea = roundMoney(subtotal_linea - descuento);

    lineas.push({
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto,
      es_servicio: producto.es_servicio === 1,
      cantidad: item.cantidad,
      precio_unitario: precio,
      descuento_linea: descuento,
      subtotal_linea,
      total_linea,
    });
  }

  return lineas;
};

const generarNumeroVenta = async (
  id_ubicacion: number,
  transaction: Transaction,
): Promise<string> => {
  const rows = await sequelize.query<{ ultimo: number }>(
    `SELECT ISNULL(MAX(
       TRY_CAST(SUBSTRING(numero_venta, 3, LEN(numero_venta)) AS INT)
     ), 0) AS ultimo
     FROM MR_VENTA
     WHERE id_ubicacion = :id_ubicacion AND borrado = 0`,
    { replacements: { id_ubicacion }, type: QueryTypes.SELECT, transaction },
  );

  const siguiente = (rows[0]?.ultimo ?? 0) + 1;
  return `V-${String(siguiente).padStart(4, '0')}`;
};

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  filters: {
    id_ubicacion?: number;
    id_cliente?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  },
): Promise<PaginatedResult<Omit<Venta, 'detalle'>>> => {
  const conditions = ['v.borrado = 0'];
  const replacements: Record<string, unknown> = { offset, limit };

  if (filters.id_ubicacion) {
    conditions.push('v.id_ubicacion = :id_ubicacion');
    replacements.id_ubicacion = filters.id_ubicacion;
  }
  if (filters.id_cliente) {
    conditions.push('v.id_cliente = :id_cliente');
    replacements.id_cliente = filters.id_cliente;
  }
  if (filters.estado) {
    conditions.push('v.estado = :estado');
    replacements.estado = filters.estado;
  }
  if (filters.fecha_inicio) {
    conditions.push('CAST(v.fecha_venta AS DATE) >= CAST(:fecha_inicio AS DATE)');
    replacements.fecha_inicio = filters.fecha_inicio;
  }
  if (filters.fecha_fin) {
    conditions.push('CAST(v.fecha_venta AS DATE) <= CAST(:fecha_fin AS DATE)');
    replacements.fecha_fin = filters.fecha_fin;
  }

  const where = conditions.join(' AND ');

  const [rows, countRows] = await Promise.all([
    sequelize.query<Omit<Venta, 'detalle'>>(
      `SELECT ${VENTA_HEADER_SELECT}
       FROM MR_VENTA v
       INNER JOIN MR_CLIENTE c ON c.id_cliente = v.id_cliente AND c.borrado = 0
       INNER JOIN MC_UBICACION u ON u.id_ubicacion = v.id_ubicacion AND u.borrado = 0
       INNER JOIN MR_USUARIO us ON us.id_usuario = v.id_usuario AND us.borrado = 0
       WHERE ${where}
       ORDER BY v.fecha_venta DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_VENTA v WHERE ${where}`,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<Venta> => {
  return buildVenta(id);
};

export const create = async (dto: CreateVentaDto): Promise<Venta> => {
  const descuentoAdicional = dto.descuento_adicional ?? 0;
  const impuestoTotal = dto.impuesto_total ?? 0;

  if (descuentoAdicional < 0) {
    throw new ValidationError('descuento_adicional no puede ser negativo');
  }
  if (impuestoTotal < 0) {
    throw new ValidationError('impuesto_total no puede ser negativo');
  }

  return sequelize.transaction(async (transaction) => {
    await assertCliente(dto.id_cliente, transaction);
    await assertUbicacion(dto.id_ubicacion, transaction);

    const lineas = await calcularLineas(dto.detalle, transaction);

    const subtotal = roundMoney(lineas.reduce((sum, l) => sum + l.subtotal_linea, 0));
    const descuentoLineas = roundMoney(lineas.reduce((sum, l) => sum + l.descuento_linea, 0));
    const descuentoTotal = roundMoney(descuentoLineas + descuentoAdicional);

    if (descuentoTotal > subtotal) {
      throw new ValidationError('El descuento total no puede superar el subtotal');
    }

    const total = roundMoney(subtotal - descuentoTotal + impuestoTotal);
    if (total < 0) {
      throw new ValidationError('El total de la venta no puede ser negativo');
    }

    for (const linea of lineas) {
      if (!linea.es_servicio) {
        const stockRows = await sequelize.query<{ cantidad_actual: number }>(
          `SELECT cantidad_actual FROM MR_INVENTARIO_UBICACION
           WHERE id_producto = :id_producto AND id_ubicacion = :id_ubicacion AND borrado = 0`,
          {
            replacements: {
              id_producto: linea.id_producto,
              id_ubicacion: dto.id_ubicacion,
            },
            type: QueryTypes.SELECT,
            transaction,
          },
        );
        const disponible = Number(stockRows[0]?.cantidad_actual ?? 0);
        if (disponible < linea.cantidad) {
          throw new ValidationError(
            `Stock insuficiente para "${linea.nombre_producto}". Disponible: ${disponible}`,
          );
        }
      }
    }

    const numeroVenta = await generarNumeroVenta(dto.id_ubicacion, transaction);

    const ventaResult = await sequelize.query<{ id_venta: number }>(
      `INSERT INTO MR_VENTA
         (numero_venta, id_cliente, id_ubicacion, id_usuario,
          subtotal, descuento_total, impuesto_total, total,
          observaciones, usuario_ingreso)
       OUTPUT INSERTED.id_venta
       VALUES (:numero, :cliente, :ubicacion, :usuario,
               :subtotal, :descuento, :impuesto, :total,
               :obs, :usuarioEmail)`,
      {
        replacements: {
          numero: numeroVenta,
          cliente: dto.id_cliente,
          ubicacion: dto.id_ubicacion,
          usuario: dto.id_usuario,
          subtotal,
          descuento: descuentoTotal,
          impuesto: impuestoTotal,
          total,
          obs: dto.observaciones ?? null,
          usuarioEmail: dto.usuario,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    const id_venta = ventaResult[0]?.id_venta;
    if (!id_venta) throw new Error('No se pudo crear la venta');

    for (const linea of lineas) {
      await sequelize.query(
        `INSERT INTO MR_VENTA_DETALLE
           (id_venta, id_producto, cantidad, precio_unitario,
            descuento_linea, subtotal_linea, total_linea, usuario_ingreso)
         VALUES (:id_venta, :id_producto, :cantidad, :precio,
                 :descuento, :subtotal, :total_linea, :usuario)`,
        {
          replacements: {
            id_venta,
            id_producto: linea.id_producto,
            cantidad: linea.cantidad,
            precio: linea.precio_unitario,
            descuento: linea.descuento_linea,
            subtotal: linea.subtotal_linea,
            total_linea: linea.total_linea,
            usuario: dto.usuario,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );

      if (!linea.es_servicio) {
        await descontarPorVenta(transaction, {
          id_producto: linea.id_producto,
          id_ubicacion: dto.id_ubicacion,
          cantidad: linea.cantidad,
          id_venta,
          usuario: dto.usuario,
        });
      }
    }

    return buildVenta(id_venta, transaction);
  });
};
