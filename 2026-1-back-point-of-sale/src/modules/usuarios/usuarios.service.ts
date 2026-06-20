import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  ultimo_login: Date | null;
  roles: string[];
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

interface DbUsuarioRow {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  ultimo_login: Date | null;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

interface DbRolRow { nombre_rol: string }

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  roles: number[];
  usuario: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  password?: string;
  activo?: boolean;
  roles?: number[];
  usuario: string;
}

const enrichWithRoles = async (rows: DbUsuarioRow[]): Promise<Usuario[]> => {
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id_usuario);
  const rolesRows = await sequelize.query<{ id_usuario: number; nombre_rol: string }>(
    `SELECT ur.id_usuario, r.nombre_rol
     FROM MR_USUARIO_ROL ur
     INNER JOIN MR_ROL r ON r.id_rol = ur.id_rol
     WHERE ur.id_usuario IN (:ids) AND ur.borrado = 0 AND r.borrado = 0`,
    { replacements: { ids }, type: QueryTypes.SELECT },
  );

  const rolesMap = new Map<number, string[]>();
  for (const row of rolesRows) {
    if (!rolesMap.has(row.id_usuario)) rolesMap.set(row.id_usuario, []);
    rolesMap.get(row.id_usuario)!.push(row.nombre_rol);
  }

  return rows.map((u) => ({ ...u, roles: rolesMap.get(u.id_usuario) ?? [] }));
};

export const findAll = async (
  page: number,
  limit: number,
  offset: number,
  search?: string,
): Promise<PaginatedResult<Usuario>> => {
  const where = search ? `AND (nombre LIKE :search OR email LIKE :search)` : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<DbUsuarioRow>(
      `SELECT id_usuario, nombre, email, activo, ultimo_login, usuario_ingreso, fecha_ingreso
       FROM MR_USUARIO
       WHERE borrado = 0 ${where}
       ORDER BY nombre
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: { offset, limit, search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_USUARIO WHERE borrado = 0 ${where}`,
      {
        replacements: { search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const data = await enrichWithRoles(rows);
  return { data, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<Usuario> => {
  const rows = await sequelize.query<DbUsuarioRow>(
    `SELECT id_usuario, nombre, email, activo, ultimo_login, usuario_ingreso, fecha_ingreso
     FROM MR_USUARIO WHERE id_usuario = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Usuario');
  return (await enrichWithRoles([rows[0]]))[0];
};

const setRoles = async (idUsuario: number, roles: number[], usuario: string): Promise<void> => {
  // Borrado lógico de roles anteriores
  await sequelize.query(
    `UPDATE MR_USUARIO_ROL SET borrado = 1, usuario_borrado = :usuario, fecha_borrado = GETDATE()
     WHERE id_usuario = :id AND borrado = 0`,
    { replacements: { id: idUsuario, usuario }, type: QueryTypes.UPDATE },
  );

  if (!roles.length) return;

  for (const idRol of roles) {
    // Reactivar si ya existía el registro
    const existing = await sequelize.query<{ id_usuario_rol: number }>(
      `SELECT id_usuario_rol FROM MR_USUARIO_ROL
       WHERE id_usuario = :idUsuario AND id_rol = :idRol`,
      { replacements: { idUsuario, idRol }, type: QueryTypes.SELECT },
    );

    if (existing[0]) {
      await sequelize.query(
        `UPDATE MR_USUARIO_ROL SET borrado = 0, usuario_borrado = NULL, fecha_borrado = NULL,
         usuario_actualiza = :usuario, fecha_actualiza = GETDATE()
         WHERE id_usuario_rol = :id`,
        { replacements: { id: existing[0].id_usuario_rol, usuario }, type: QueryTypes.UPDATE },
      );
    } else {
      await sequelize.query(
        `INSERT INTO MR_USUARIO_ROL (id_usuario, id_rol, usuario_ingreso) VALUES (:idUsuario, :idRol, :usuario)`,
        { replacements: { idUsuario, idRol, usuario }, type: QueryTypes.INSERT },
      );
    }
  }
};

export const create = async (dto: CreateUsuarioDto): Promise<Usuario> => {
  const exists = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM MR_USUARIO WHERE email = :email AND borrado = 0`,
    { replacements: { email: dto.email.toLowerCase() }, type: QueryTypes.SELECT },
  );
  if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('El email ya está registrado');

  const hash = await bcrypt.hash(dto.password, 12);

  const result = await sequelize.query<{ id_usuario: number }>(
    `INSERT INTO MR_USUARIO (nombre, email, hash_contrasena, activo, usuario_ingreso)
     OUTPUT INSERTED.id_usuario
     VALUES (:nombre, :email, :hash, 1, :usuario)`,
    {
      replacements: { nombre: dto.nombre, email: dto.email.toLowerCase(), hash, usuario: dto.usuario },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_usuario;
  if (dto.roles.length) await setRoles(id, dto.roles, dto.usuario);
  return findById(id);
};

export const update = async (id: number, dto: UpdateUsuarioDto): Promise<Usuario> => {
  await findById(id);

  if (dto.email) {
    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_USUARIO WHERE email = :email AND borrado = 0 AND id_usuario <> :id`,
      { replacements: { email: dto.email.toLowerCase(), id }, type: QueryTypes.SELECT },
    );
    if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('El email ya está registrado por otro usuario');
  }

  let hashSql = '';
  const replacements: Record<string, unknown> = {
    nombre: dto.nombre ?? null,
    email: dto.email ? dto.email.toLowerCase() : null,
    activo: dto.activo !== undefined ? (dto.activo ? 1 : 0) : null,
    usuario: dto.usuario,
    id,
  };

  if (dto.password) {
    replacements.hash = await bcrypt.hash(dto.password, 12);
    hashSql = ', hash_contrasena = :hash';
  }

  await sequelize.query(
    `UPDATE MR_USUARIO SET
       nombre    = COALESCE(:nombre, nombre),
       email     = COALESCE(:email, email),
       activo    = COALESCE(:activo, activo)
       ${hashSql},
       usuario_actualiza = :usuario,
       fecha_actualiza = GETDATE()
     WHERE id_usuario = :id AND borrado = 0`,
    { replacements, type: QueryTypes.UPDATE },
  );

  if (dto.roles !== undefined) await setRoles(id, dto.roles, dto.usuario);
  return findById(id);
};

export const remove = async (id: number, usuario: string): Promise<void> => {
  await findById(id);
  await sequelize.query(
    `UPDATE MR_USUARIO SET borrado = 1, usuario_borrado = :usuario, fecha_borrado = GETDATE()
     WHERE id_usuario = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};

export const getRoles = async (): Promise<DbRolRow[]> => {
  return sequelize.query<DbRolRow>(
    `SELECT id_rol, nombre_rol, descripcion FROM MR_ROL WHERE borrado = 0 ORDER BY nombre_rol`,
    { type: QueryTypes.SELECT },
  );
};
