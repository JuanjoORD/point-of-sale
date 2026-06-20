import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string | null;
  borrado: boolean;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

export interface CreateCategoriaDto {
  nombre_categoria: string;
  descripcion?: string;
  usuario: string;
}

export interface UpdateCategoriaDto {
  nombre_categoria?: string;
  descripcion?: string;
  usuario: string;
}

const BASE_SELECT = `
  id_categoria,
  nombre_categoria,
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
): Promise<PaginatedResult<Categoria>> => {
  const where = search
    ? `AND nombre_categoria LIKE :search`
    : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<Categoria>(
      `SELECT ${BASE_SELECT}
       FROM MC_CATEGORIA
       WHERE borrado = 0 ${where}
       ORDER BY nombre_categoria
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: { offset, limit, search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MC_CATEGORIA WHERE borrado = 0 ${where}`,
      {
        replacements: { search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<Categoria> => {
  const rows = await sequelize.query<Categoria>(
    `SELECT ${BASE_SELECT} FROM MC_CATEGORIA WHERE id_categoria = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Categoría');
  return rows[0];
};

export const create = async (dto: CreateCategoriaDto): Promise<Categoria> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MC_CATEGORIA
     WHERE nombre_categoria = :nombre AND borrado = 0`,
    { replacements: { nombre: dto.nombre_categoria }, type: QueryTypes.SELECT },
  );
  if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('Ya existe una categoría con ese nombre');

  const result = await sequelize.query<{ id_categoria: number }>(
    `INSERT INTO MC_CATEGORIA (nombre_categoria, descripcion, usuario_ingreso)
     OUTPUT INSERTED.id_categoria
     VALUES (:nombre, :desc, :usuario)`,
    {
      replacements: {
        nombre: dto.nombre_categoria,
        desc: dto.descripcion ?? null,
        usuario: dto.usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_categoria;
  return findById(id);
};

export const update = async (id: number, dto: UpdateCategoriaDto): Promise<Categoria> => {
  await findById(id);

  if (dto.nombre_categoria) {
    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MC_CATEGORIA
       WHERE nombre_categoria = :nombre AND borrado = 0 AND id_categoria <> :id`,
      { replacements: { nombre: dto.nombre_categoria, id }, type: QueryTypes.SELECT },
    );
    if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('Ya existe una categoría con ese nombre');
  }

  await sequelize.query(
    `UPDATE MC_CATEGORIA SET
       nombre_categoria = COALESCE(:nombre, nombre_categoria),
       descripcion = COALESCE(:desc, descripcion),
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_categoria = :id AND borrado = 0`,
    {
      replacements: {
        nombre: dto.nombre_categoria ?? null,
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
    `SELECT COUNT(*) AS total FROM MR_PRODUCTO
     WHERE id_categoria = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if ((inUse[0]?.total ?? 0) > 0)
    throw new ConflictError('No se puede eliminar: la categoría tiene productos asociados');

  await sequelize.query(
    `UPDATE MC_CATEGORIA SET
       borrado = 1,
       usuario_borrado = :usuario,
       fecha_borrado = GETDATE()
     WHERE id_categoria = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
