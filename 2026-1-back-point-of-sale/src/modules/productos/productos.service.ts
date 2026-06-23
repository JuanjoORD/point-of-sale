import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  descripcion: string | null;
  codigo_barras: string | null;
  precio_costo: number;
  precio_venta: number;
  es_servicio: boolean;
  id_categoria: number | null;
  nombre_categoria: string | null;
  id_ubicacion_almacenamiento: number | null;
  estanteria: string | null;
  fila: string | null;
  caja: string | null;
  activo: boolean;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

export interface CreateProductoDto {
  nombre_producto: string;
  descripcion?: string;
  codigo_barras?: string;
  precio_costo: number;
  precio_venta: number;
  es_servicio?: boolean;
  id_categoria?: number;
  id_ubicacion_almacenamiento?: number;
  usuario: string;
}

export interface UpdateProductoDto {
  nombre_producto?: string;
  descripcion?: string;
  codigo_barras?: string | null;
  precio_costo?: number;
  precio_venta?: number;
  es_servicio?: boolean;
  id_categoria?: number | null;
  id_ubicacion_almacenamiento?: number | null;
  activo?: boolean;
  usuario: string;
}

const BASE_SELECT = `
  p.id_producto,
  p.nombre_producto,
  p.descripcion,
  p.codigo_barras,
  p.precio_costo,
  p.precio_venta,
  p.es_servicio,
  p.id_categoria,
  c.nombre_categoria,
  p.id_ubicacion_almacenamiento,
  ua.estanteria,
  ua.fila,
  ua.caja,
  p.activo,
  p.usuario_ingreso,
  p.fecha_ingreso,
  p.usuario_actualiza,
  p.fecha_actualiza
`;

const BASE_FROM = `
  FROM MR_PRODUCTO p
  LEFT JOIN MC_CATEGORIA c ON c.id_categoria = p.id_categoria AND c.borrado = 0
  LEFT JOIN MC_UBICACION_ALMACENAMIENTO ua
    ON ua.id_ubicacion_almacenamiento = p.id_ubicacion_almacenamiento AND ua.borrado = 0
`;

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  search?: string,
  soloActivos = true,
): Promise<PaginatedResult<Producto>> => {
  const activoFilter = soloActivos ? 'AND p.activo = 1' : '';
  const searchFilter = search ? 'AND (p.nombre_producto LIKE :search OR p.codigo_barras LIKE :searchExact)' : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<Producto>(
      `SELECT ${BASE_SELECT}
       ${BASE_FROM}
       WHERE p.borrado = 0 ${activoFilter} ${searchFilter}
       ORDER BY p.nombre_producto
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: {
          offset,
          limit,
          search: search ? `%${search}%` : undefined,
          searchExact: search ?? undefined,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM MR_PRODUCTO p
       WHERE p.borrado = 0 ${activoFilter} ${searchFilter}`,
      {
        replacements: {
          search: search ? `%${search}%` : undefined,
          searchExact: search ?? undefined,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const buscar = async (q: string): Promise<Producto[]> => {
  return sequelize.query<Producto>(
    `SELECT TOP 20 ${BASE_SELECT}
     ${BASE_FROM}
     WHERE p.borrado = 0 AND p.activo = 1
       AND (p.nombre_producto LIKE :search OR p.codigo_barras = :exacto)
     ORDER BY p.nombre_producto`,
    {
      replacements: { search: `%${q}%`, exacto: q },
      type: QueryTypes.SELECT,
    },
  );
};

export const findById = async (id: number): Promise<Producto> => {
  const rows = await sequelize.query<Producto>(
    `SELECT ${BASE_SELECT}
     ${BASE_FROM}
     WHERE p.id_producto = :id AND p.borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Producto');
  return rows[0];
};

const checkBarcode = async (codigo_barras: string, excludeId?: number): Promise<void> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MR_PRODUCTO
     WHERE codigo_barras = :codigo AND borrado = 0
       ${excludeId ? 'AND id_producto <> :excludeId' : ''}`,
    { replacements: { codigo: codigo_barras, excludeId }, type: QueryTypes.SELECT },
  );
  if ((exists[0]?.total ?? 0) > 0)
    throw new ConflictError('Ya existe un producto con ese código de barras');
};

export const create = async (dto: CreateProductoDto): Promise<Producto> => {
  if (dto.codigo_barras) await checkBarcode(dto.codigo_barras);

  const result = await sequelize.query<{ id_producto: number }>(
    `INSERT INTO MR_PRODUCTO
       (nombre_producto, descripcion, codigo_barras, precio_costo, precio_venta,
        es_servicio, id_categoria, id_ubicacion_almacenamiento, usuario_ingreso)
     OUTPUT INSERTED.id_producto
     VALUES (:nombre, :desc, :barcode, :costo, :venta, :servicio, :cat, :ubicacion, :usuario)`,
    {
      replacements: {
        nombre: dto.nombre_producto,
        desc: dto.descripcion ?? null,
        barcode: dto.codigo_barras ?? null,
        costo: dto.precio_costo,
        venta: dto.precio_venta,
        servicio: dto.es_servicio ? 1 : 0,
        cat: dto.id_categoria ?? null,
        ubicacion: dto.id_ubicacion_almacenamiento ?? null,
        usuario: dto.usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_producto;
  return findById(id);
};

export const update = async (id: number, dto: UpdateProductoDto): Promise<Producto> => {
  await findById(id);

  if (dto.codigo_barras) await checkBarcode(dto.codigo_barras, id);

  await sequelize.query(
    `UPDATE MR_PRODUCTO SET
       nombre_producto  = COALESCE(:nombre,   nombre_producto),
       descripcion      = COALESCE(:desc,     descripcion),
       codigo_barras    = CASE WHEN :barcodeNull = 1 THEN NULL
                               WHEN :barcode IS NOT NULL THEN :barcode
                               ELSE codigo_barras END,
       precio_costo     = COALESCE(:costo,    precio_costo),
       precio_venta     = COALESCE(:venta,    precio_venta),
       es_servicio      = COALESCE(:servicio, es_servicio),
       id_categoria     = CASE WHEN :catNull = 1 THEN NULL
                               WHEN :cat IS NOT NULL THEN :cat
                               ELSE id_categoria END,
       id_ubicacion_almacenamiento = CASE WHEN :ubicNull = 1 THEN NULL
                                          WHEN :ubicacion IS NOT NULL THEN :ubicacion
                                          ELSE id_ubicacion_almacenamiento END,
       activo           = COALESCE(:activo,   activo),
       usuario_actualiza = :usuario,
       fecha_actualiza  = GETDATE()
     WHERE id_producto = :id AND borrado = 0`,
    {
      replacements: {
        nombre:      dto.nombre_producto ?? null,
        desc:        dto.descripcion     ?? null,
        barcode:     dto.codigo_barras   ?? null,
        barcodeNull: dto.codigo_barras === null ? 1 : 0,
        costo:       dto.precio_costo    ?? null,
        venta:       dto.precio_venta    ?? null,
        servicio:    dto.es_servicio !== undefined ? (dto.es_servicio ? 1 : 0) : null,
        cat:         dto.id_categoria    ?? null,
        catNull:     dto.id_categoria   === null ? 1 : 0,
        ubicacion:   dto.id_ubicacion_almacenamiento ?? null,
        ubicNull:    dto.id_ubicacion_almacenamiento === null ? 1 : 0,
        activo:      dto.activo !== undefined ? (dto.activo ? 1 : 0) : null,
        usuario:     dto.usuario,
        id,
      },
      type: QueryTypes.UPDATE,
    },
  );

  return findById(id);
};

export const remove = async (id: number, usuario: string): Promise<void> => {
  await findById(id);

  await sequelize.query(
    `UPDATE MR_PRODUCTO SET
       borrado = 1,
       usuario_borrado = :usuario,
       fecha_borrado = GETDATE()
     WHERE id_producto = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
