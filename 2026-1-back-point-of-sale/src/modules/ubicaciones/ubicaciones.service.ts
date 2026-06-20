import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Ubicacion {
  id_ubicacion: number;
  nombre_ubicacion: string;
  descripcion: string | null;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

export interface CreateUbicacionDto {
  nombre_ubicacion: string;
  descripcion?: string;
  usuario: string;
}

export interface UpdateUbicacionDto {
  nombre_ubicacion?: string;
  descripcion?: string;
  usuario: string;
}

const BASE_SELECT = `
  id_ubicacion,
  nombre_ubicacion,
  descripcion,
  usuario_ingreso,
  fecha_ingreso,
  usuario_actualiza,
  fecha_actualiza
`;

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  search?: string,
): Promise<PaginatedResult<Ubicacion>> => {
  const where = search ? `AND nombre_ubicacion LIKE :search` : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<Ubicacion>(
      `SELECT ${BASE_SELECT}
       FROM MC_UBICACION
       WHERE borrado = 0 ${where}
       ORDER BY nombre_ubicacion
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: { offset, limit, search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MC_UBICACION WHERE borrado = 0 ${where}`,
      {
        replacements: { search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<Ubicacion> => {
  const rows = await sequelize.query<Ubicacion>(
    `SELECT ${BASE_SELECT} FROM MC_UBICACION WHERE id_ubicacion = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Ubicación');
  return rows[0];
};

export const create = async (dto: CreateUbicacionDto): Promise<Ubicacion> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MC_UBICACION
     WHERE nombre_ubicacion = :nombre AND borrado = 0`,
    { replacements: { nombre: dto.nombre_ubicacion }, type: QueryTypes.SELECT },
  );
  if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('Ya existe una ubicación con ese nombre');

  const result = await sequelize.query<{ id_ubicacion: number }>(
    `INSERT INTO MC_UBICACION (nombre_ubicacion, descripcion, usuario_ingreso)
     OUTPUT INSERTED.id_ubicacion
     VALUES (:nombre, :desc, :usuario)`,
    {
      replacements: {
        nombre: dto.nombre_ubicacion,
        desc: dto.descripcion ?? null,
        usuario: dto.usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_ubicacion;
  return findById(id);
};

export const update = async (id: number, dto: UpdateUbicacionDto): Promise<Ubicacion> => {
  await findById(id);

  if (dto.nombre_ubicacion) {
    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MC_UBICACION
       WHERE nombre_ubicacion = :nombre AND borrado = 0 AND id_ubicacion <> :id`,
      { replacements: { nombre: dto.nombre_ubicacion, id }, type: QueryTypes.SELECT },
    );
    if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('Ya existe una ubicación con ese nombre');
  }

  await sequelize.query(
    `UPDATE MC_UBICACION SET
       nombre_ubicacion = COALESCE(:nombre, nombre_ubicacion),
       descripcion = COALESCE(:desc, descripcion),
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_ubicacion = :id AND borrado = 0`,
    {
      replacements: {
        nombre: dto.nombre_ubicacion ?? null,
        desc: dto.descripcion ?? null,
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
    `SELECT COUNT(*) AS total FROM MR_INVENTARIO_UBICACION
     WHERE id_ubicacion = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if ((inUse[0]?.total ?? 0) > 0)
    throw new ConflictError('No se puede eliminar: la ubicación tiene inventario asociado');

  await sequelize.query(
    `UPDATE MC_UBICACION SET
       borrado = 1,
       usuario_borrado = :usuario,
       fecha_borrado = GETDATE()
     WHERE id_ubicacion = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
