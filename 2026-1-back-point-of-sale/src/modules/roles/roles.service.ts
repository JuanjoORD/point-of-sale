import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  permisos: string[];
}

export interface Permiso {
  id_permiso: number;
  codigo_permiso: string;
  descripcion: string | null;
}

export interface CreateRolDto {
  nombre_rol: string;
  descripcion?: string;
  permisos: number[];
  usuario: string;
}

export interface UpdateRolDto {
  nombre_rol?: string;
  descripcion?: string;
  permisos?: number[];
  usuario: string;
}

const enrichRolWithPermisos = async (id_rol: number): Promise<string[]> => {
  const rows = await sequelize.query<{ codigo_permiso: string }>(
    `SELECT p.codigo_permiso FROM MR_ROL_PERMISO rp
     INNER JOIN MR_PERMISO p ON p.id_permiso = rp.id_permiso
     WHERE rp.id_rol = :id_rol AND rp.borrado = 0 AND p.borrado = 0`,
    { replacements: { id_rol }, type: QueryTypes.SELECT },
  );
  return rows.map((r) => r.codigo_permiso);
};

export const findAllRoles = async (
  page: number, limit: number, offset: number,
): Promise<PaginatedResult<Rol>> => {
  const [rows, countRows] = await Promise.all([
    sequelize.query<{ id_rol: number; nombre_rol: string; descripcion: string | null }>(
      `SELECT id_rol, nombre_rol, descripcion FROM MR_ROL
       WHERE borrado = 0 ORDER BY nombre_rol
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { replacements: { offset, limit }, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_ROL WHERE borrado = 0`,
      { type: QueryTypes.SELECT },
    ),
  ]);

  const data = await Promise.all(
    rows.map(async (r) => ({ ...r, permisos: await enrichRolWithPermisos(r.id_rol) })),
  );

  return { data, total: countRows[0]?.total ?? 0, page, limit };
};

export const findRolById = async (id: number): Promise<Rol> => {
  const rows = await sequelize.query<{ id_rol: number; nombre_rol: string; descripcion: string | null }>(
    `SELECT id_rol, nombre_rol, descripcion FROM MR_ROL WHERE id_rol = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Rol');
  return { ...rows[0], permisos: await enrichRolWithPermisos(rows[0].id_rol) };
};

export const findAllPermisos = async (): Promise<Permiso[]> => {
  return sequelize.query<Permiso>(
    `SELECT id_permiso, codigo_permiso, descripcion FROM MR_PERMISO
     WHERE borrado = 0 ORDER BY codigo_permiso`,
    { type: QueryTypes.SELECT },
  );
};

const setPermisos = async (idRol: number, permisos: number[], usuario: string): Promise<void> => {
  await sequelize.query(
    `UPDATE MR_ROL_PERMISO SET borrado = 1, usuario_borrado = :usuario, fecha_borrado = GETDATE()
     WHERE id_rol = :idRol AND borrado = 0`,
    { replacements: { idRol, usuario }, type: QueryTypes.UPDATE },
  );

  for (const idPermiso of permisos) {
    const existing = await sequelize.query<{ id_rol_permiso: number }>(
      `SELECT id_rol_permiso FROM MR_ROL_PERMISO WHERE id_rol = :idRol AND id_permiso = :idPermiso`,
      { replacements: { idRol, idPermiso }, type: QueryTypes.SELECT },
    );
    if (existing[0]) {
      await sequelize.query(
        `UPDATE MR_ROL_PERMISO SET borrado = 0, usuario_borrado = NULL, fecha_borrado = NULL,
         usuario_actualiza = :usuario, fecha_actualiza = GETDATE()
         WHERE id_rol_permiso = :id`,
        { replacements: { id: existing[0].id_rol_permiso, usuario }, type: QueryTypes.UPDATE },
      );
    } else {
      await sequelize.query(
        `INSERT INTO MR_ROL_PERMISO (id_rol, id_permiso, usuario_ingreso) VALUES (:idRol, :idPermiso, :usuario)`,
        { replacements: { idRol, idPermiso, usuario }, type: QueryTypes.INSERT },
      );
    }
  }
};

export const createRol = async (dto: CreateRolDto): Promise<Rol> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MR_ROL WHERE nombre_rol = :nombre AND borrado = 0`,
    { replacements: { nombre: dto.nombre_rol }, type: QueryTypes.SELECT },
  );
  if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('Ya existe un rol con ese nombre');

  const result = await sequelize.query<{ id_rol: number }>(
    `INSERT INTO MR_ROL (nombre_rol, descripcion, usuario_ingreso)
     OUTPUT INSERTED.id_rol VALUES (:nombre, :desc, :usuario)`,
    {
      replacements: { nombre: dto.nombre_rol, desc: dto.descripcion ?? null, usuario: dto.usuario },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_rol;
  if (dto.permisos.length) await setPermisos(id, dto.permisos, dto.usuario);
  return findRolById(id);
};

export const updateRol = async (id: number, dto: UpdateRolDto): Promise<Rol> => {
  await findRolById(id);

  await sequelize.query(
    `UPDATE MR_ROL SET
       nombre_rol = COALESCE(:nombre, nombre_rol),
       descripcion = COALESCE(:desc, descripcion),
       usuario_actualiza = :usuario, fecha_actualiza = GETDATE()
     WHERE id_rol = :id AND borrado = 0`,
    {
      replacements: { nombre: dto.nombre_rol ?? null, desc: dto.descripcion ?? null, usuario: dto.usuario, id },
      type: QueryTypes.UPDATE,
    },
  );

  if (dto.permisos !== undefined) await setPermisos(id, dto.permisos, dto.usuario);
  return findRolById(id);
};

export const removeRol = async (id: number, usuario: string): Promise<void> => {
  await findRolById(id);

  const inUse = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MR_USUARIO_ROL WHERE id_rol = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if ((inUse[0]?.total ?? 0) > 0)
    throw new ConflictError('No se puede eliminar: el rol tiene usuarios asignados');

  await sequelize.query(
    `UPDATE MR_ROL SET borrado = 1, usuario_borrado = :usuario, fecha_borrado = GETDATE()
     WHERE id_rol = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
