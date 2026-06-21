import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { ValidationError } from '../../shared/errors/AppError';

export interface ReporteFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha?: string;
  id_ubicacion?: number;
  limit?: number;
}

export interface ResumenVentas {
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha?: string;
  id_ubicacion?: number;
  total_ventas: number;
  cantidad_tickets: number;
  ticket_promedio: number;
}

export interface TopProducto {
  id_producto: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_vendido: number;
}

export interface VentasDiaResponse extends ResumenVentas {
  fecha: string;
  top_productos: TopProducto[];
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const parseOptionalInt = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseLimit = (value: unknown): number => {
  const parsed = parseOptionalInt(value);
  if (!parsed) return 10;
  return Math.min(50, Math.max(1, parsed));
};

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const assertDate = (value: string, field: string): void => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(`${field} debe tener formato YYYY-MM-DD`);
  }
};

const assertDateRange = (fecha_inicio: string, fecha_fin: string): void => {
  assertDate(fecha_inicio, 'fecha_inicio');
  assertDate(fecha_fin, 'fecha_fin');
  if (fecha_inicio > fecha_fin) {
    throw new ValidationError('fecha_inicio no puede ser mayor que fecha_fin');
  }
};

const buildVentaConditions = (
  filters: { fecha?: string; fecha_inicio?: string; fecha_fin?: string; id_ubicacion?: number },
  alias = 'v',
): { where: string; replacements: Record<string, unknown> } => {
  const conditions = [`${alias}.borrado = 0`, `${alias}.estado = 'COMPLETADA'`];
  const replacements: Record<string, unknown> = {};

  if (filters.fecha) {
    conditions.push(`CAST(${alias}.fecha_venta AS DATE) = CAST(:fecha AS DATE)`);
    replacements.fecha = filters.fecha;
  }
  if (filters.fecha_inicio) {
    conditions.push(`CAST(${alias}.fecha_venta AS DATE) >= CAST(:fecha_inicio AS DATE)`);
    replacements.fecha_inicio = filters.fecha_inicio;
  }
  if (filters.fecha_fin) {
    conditions.push(`CAST(${alias}.fecha_venta AS DATE) <= CAST(:fecha_fin AS DATE)`);
    replacements.fecha_fin = filters.fecha_fin;
  }
  if (filters.id_ubicacion) {
    conditions.push(`${alias}.id_ubicacion = :id_ubicacion`);
    replacements.id_ubicacion = filters.id_ubicacion;
  }

  return { where: conditions.join(' AND '), replacements };
};

const fetchResumenVentas = async (
  filters: { fecha?: string; fecha_inicio?: string; fecha_fin?: string; id_ubicacion?: number },
): Promise<Omit<ResumenVentas, 'fecha' | 'fecha_inicio' | 'fecha_fin' | 'id_ubicacion'>> => {
  const { where, replacements } = buildVentaConditions(filters);

  const rows = await sequelize.query<{ cantidad_tickets: number; total_ventas: number }>(
    `SELECT
       COUNT(*) AS cantidad_tickets,
       ISNULL(SUM(v.total), 0) AS total_ventas
     FROM MR_VENTA v
     WHERE ${where}`,
    { replacements, type: QueryTypes.SELECT },
  );

  const cantidad_tickets = Number(rows[0]?.cantidad_tickets ?? 0);
  const total_ventas = roundMoney(Number(rows[0]?.total_ventas ?? 0));
  const ticket_promedio =
    cantidad_tickets > 0 ? roundMoney(total_ventas / cantidad_tickets) : 0;

  return { total_ventas, cantidad_tickets, ticket_promedio };
};

const fetchTopProductos = async (
  filters: { fecha?: string; fecha_inicio?: string; fecha_fin?: string; id_ubicacion?: number },
  orderBy: 'cantidad' | 'valor',
  limit: number,
): Promise<TopProducto[]> => {
  const { where, replacements } = buildVentaConditions(filters, 'v');
  const orderClause =
    orderBy === 'cantidad' ? 'SUM(d.cantidad) DESC' : 'SUM(d.total_linea) DESC';

  return sequelize.query<TopProducto>(
    `SELECT TOP (${limit})
       d.id_producto,
       p.nombre_producto,
       SUM(d.cantidad) AS cantidad_vendida,
       SUM(d.total_linea) AS total_vendido
     FROM MR_VENTA_DETALLE d
     INNER JOIN MR_VENTA v ON v.id_venta = d.id_venta
     INNER JOIN MR_PRODUCTO p ON p.id_producto = d.id_producto AND p.borrado = 0
     WHERE d.borrado = 0 AND ${where}
     GROUP BY d.id_producto, p.nombre_producto
     ORDER BY ${orderClause}`,
    { replacements, type: QueryTypes.SELECT },
  );
};

export const getVentasDia = async (filters: ReporteFilters): Promise<VentasDiaResponse> => {
  const fecha = filters.fecha ?? todayIsoDate();
  assertDate(fecha, 'fecha');

  const resumen = await fetchResumenVentas({
    fecha,
    id_ubicacion: filters.id_ubicacion,
  });

  const top_productos = await fetchTopProductos(
    { fecha, id_ubicacion: filters.id_ubicacion },
    'cantidad',
    5,
  );

  return {
    fecha,
    id_ubicacion: filters.id_ubicacion,
    ...resumen,
    top_productos,
  };
};

export const getVentasRango = async (filters: ReporteFilters): Promise<ResumenVentas> => {
  if (!filters.fecha_inicio || !filters.fecha_fin) {
    throw new ValidationError('fecha_inicio y fecha_fin son requeridos');
  }
  assertDateRange(filters.fecha_inicio, filters.fecha_fin);

  const resumen = await fetchResumenVentas({
    fecha_inicio: filters.fecha_inicio,
    fecha_fin: filters.fecha_fin,
    id_ubicacion: filters.id_ubicacion,
  });

  return {
    fecha_inicio: filters.fecha_inicio,
    fecha_fin: filters.fecha_fin,
    id_ubicacion: filters.id_ubicacion,
    ...resumen,
  };
};

export const getTopProductosCantidad = async (
  filters: ReporteFilters,
): Promise<{ fecha_inicio: string; fecha_fin: string; id_ubicacion?: number; data: TopProducto[] }> => {
  if (!filters.fecha_inicio || !filters.fecha_fin) {
    throw new ValidationError('fecha_inicio y fecha_fin son requeridos');
  }
  assertDateRange(filters.fecha_inicio, filters.fecha_fin);

  const limit = parseLimit(String(filters.limit ?? ''));
  const data = await fetchTopProductos(
    {
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
      id_ubicacion: filters.id_ubicacion,
    },
    'cantidad',
    limit,
  );

  return {
    fecha_inicio: filters.fecha_inicio,
    fecha_fin: filters.fecha_fin,
    id_ubicacion: filters.id_ubicacion,
    data,
  };
};

export const getTopProductosValor = async (
  filters: ReporteFilters,
): Promise<{ fecha_inicio: string; fecha_fin: string; id_ubicacion?: number; data: TopProducto[] }> => {
  if (!filters.fecha_inicio || !filters.fecha_fin) {
    throw new ValidationError('fecha_inicio y fecha_fin son requeridos');
  }
  assertDateRange(filters.fecha_inicio, filters.fecha_fin);

  const limit = parseLimit(String(filters.limit ?? ''));
  const data = await fetchTopProductos(
    {
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
      id_ubicacion: filters.id_ubicacion,
    },
    'valor',
    limit,
  );

  return {
    fecha_inicio: filters.fecha_inicio,
    fecha_fin: filters.fecha_fin,
    id_ubicacion: filters.id_ubicacion,
    data,
  };
};

export const parseReporteFilters = (query: Record<string, unknown>): ReporteFilters => ({
  fecha: typeof query.fecha === 'string' && query.fecha.trim() ? query.fecha.trim() : undefined,
  fecha_inicio:
    typeof query.fecha_inicio === 'string' && query.fecha_inicio.trim()
      ? query.fecha_inicio.trim()
      : undefined,
  fecha_fin:
    typeof query.fecha_fin === 'string' && query.fecha_fin.trim()
      ? query.fecha_fin.trim()
      : undefined,
  id_ubicacion: parseOptionalInt(query.id_ubicacion),
  limit: parseOptionalInt(query.limit),
});
