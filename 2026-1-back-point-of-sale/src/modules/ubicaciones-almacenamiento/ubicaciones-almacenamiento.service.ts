import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface UbicacionAlmacenamiento {
  id_ubicacion_almacenamiento: number;
  estanteria: string;
  fila: string | null;
  caja: string | null;
  descripcion: string | null;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

export interface CreateUbicacionAlmacenamientoDto {
  estanteria: string;
  fila?: string;
  caja?: string;
  descripcion?: string;
  usuario: string;
}

export interface UpdateUbicacionAlmacenamientoDto {
  estanteria?: string;
  fila?: string | null;
  caja?: string | null;
  descripcion?: string | null;
  usuario: string;
}

const BASE_SELECT = `
  id_ubicacion_almacenamiento,
  estanteria,
  fila,
  caja,
  descripcion,
  usuario_ingreso,
  fecha_ingreso,
  usuario_actualiza,
  fecha_actualiza
`;

export const formatEtiqueta = (row: {
  estanteria: string;
  fila?: string | null;
  caja?: string | null;
}): string => {
  const parts: string[] = [`Est. ${row.estanteria}`];
  if (row.fila) parts.push(`Fila ${row.fila}`);
  if (row.caja) parts.push(`Caja ${row.caja}`);
  return parts.join(' / ');
};

const assertUniqueSlot = async (
  estanteria: string,
  fila: string | null,
  caja: string | null,
  excludeId?: number,
): Promise<void> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MC_UBICACION_ALMACENAMIENTO
     WHERE borrado = 0
       AND estanteria = :estanteria
       AND ISNULL(fila, '') = ISNULL(:fila, '')
       AND ISNULL(caja, '') = ISNULL(:caja, '')
       ${excludeId ? 'AND id_ubicacion_almacenamiento <> :excludeId' : ''}`,
    {
      replacements: { estanteria, fila, caja, excludeId },
      type: QueryTypes.SELECT,
    },
  );
  if ((exists[0]?.total ?? 0) > 0) {
    throw new ConflictError('Ya existe una ubicacion de almacenamiento con esa combinacion.');
  }
};

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  search?: string,
): Promise<PaginatedResult<UbicacionAlmacenamiento>> => {
  const where = search
    ? `AND (
         estanteria LIKE :search OR
         fila LIKE :search OR
         caja LIKE :search OR
         descripcion LIKE :search
       )`
    : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<UbicacionAlmacenamiento>(
      `SELECT ${BASE_SELECT}
       FROM MC_UBICACION_ALMACENAMIENTO
       WHERE borrado = 0 ${where}
       ORDER BY estanteria, fila, caja
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: { offset, limit, search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MC_UBICACION_ALMACENAMIENTO WHERE borrado = 0 ${where}`,
      {
        replacements: { search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<UbicacionAlmacenamiento> => {
  const rows = await sequelize.query<UbicacionAlmacenamiento>(
    `SELECT ${BASE_SELECT}
     FROM MC_UBICACION_ALMACENAMIENTO
     WHERE id_ubicacion_almacenamiento = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Ubicacion de almacenamiento');
  return rows[0];
};

export const create = async (dto: CreateUbicacionAlmacenamientoDto): Promise<UbicacionAlmacenamiento> => {
  const fila = dto.fila?.trim() || null;
  const caja = dto.caja?.trim() || null;
  await assertUniqueSlot(dto.estanteria.trim(), fila, caja);

  const result = await sequelize.query<{ id_ubicacion_almacenamiento: number }>(
    `INSERT INTO MC_UBICACION_ALMACENAMIENTO
       (estanteria, fila, caja, descripcion, usuario_ingreso)
     OUTPUT INSERTED.id_ubicacion_almacenamiento
     VALUES (:estanteria, :fila, :caja, :desc, :usuario)`,
    {
      replacements: {
        estanteria: dto.estanteria.trim(),
        fila,
        caja,
        desc: dto.descripcion?.trim() || null,
        usuario: dto.usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_ubicacion_almacenamiento;
  return findById(id);
};

export const update = async (
  id: number,
  dto: UpdateUbicacionAlmacenamientoDto,
): Promise<UbicacionAlmacenamiento> => {
  const current = await findById(id);

  const estanteria = dto.estanteria?.trim() ?? current.estanteria;
  const fila =
    dto.fila === null ? null : dto.fila !== undefined ? dto.fila.trim() || null : current.fila;
  const caja =
    dto.caja === null ? null : dto.caja !== undefined ? dto.caja.trim() || null : current.caja;

  await assertUniqueSlot(estanteria, fila, caja, id);

  await sequelize.query(
    `UPDATE MC_UBICACION_ALMACENAMIENTO SET
       estanteria = :estanteria,
       fila = :fila,
       caja = :caja,
       descripcion = CASE WHEN :descNull = 1 THEN NULL
                          WHEN :desc IS NOT NULL THEN :desc
                          ELSE descripcion END,
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_ubicacion_almacenamiento = :id AND borrado = 0`,
    {
      replacements: {
        estanteria,
        fila,
        caja,
        desc: dto.descripcion?.trim() ?? null,
        descNull: dto.descripcion === null ? 1 : 0,
        usuario: dto.usuario,
        id,
      },
      type: QueryTypes.UPDATE,
    },
  );

  return findById(id);
};

export const remove = async (id: number, usuario: string): Promise<void> => {
  await findById(id);

  const inUse = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MR_PRODUCTO
     WHERE id_ubicacion_almacenamiento = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if ((inUse[0]?.total ?? 0) > 0) {
    throw new ConflictError('No se puede eliminar: hay productos asignados a esta ubicacion.');
  }

  await sequelize.query(
    `UPDATE MC_UBICACION_ALMACENAMIENTO SET
       borrado = 1,
       usuario_borrado = :usuario,
       fecha_borrado = GETDATE()
     WHERE id_ubicacion_almacenamiento = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
