import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { PaginatedResult } from '../../shared/utils/response';

export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  es_consumidor_final: boolean;
  activo: boolean;
  usuario_ingreso: string;
  fecha_ingreso: Date;
}

export interface CreateClienteDto {
  nombre_cliente: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuario: string;
}

export interface UpdateClienteDto {
  nombre_cliente?: string;
  nit?: string | null;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  usuario: string;
}

const BASE_SELECT = `
  id_cliente, nombre_cliente, nit, direccion, telefono, email,
  es_consumidor_final, activo, usuario_ingreso, fecha_ingreso,
  usuario_actualiza, fecha_actualiza
`;

export const findAll = async (
  page: number, limit: number, offset: number, search?: string,
): Promise<PaginatedResult<Cliente>> => {
  const where = search ? `AND (nombre_cliente LIKE :search OR nit LIKE :search)` : '';

  const [rows, countRows] = await Promise.all([
    sequelize.query<Cliente>(
      `SELECT ${BASE_SELECT} FROM MR_CLIENTE
       WHERE borrado = 0 ${where}
       ORDER BY nombre_cliente
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        replacements: { offset, limit, search: search ? `%${search}%` : undefined },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_CLIENTE WHERE borrado = 0 ${where}`,
      { replacements: { search: search ? `%${search}%` : undefined }, type: QueryTypes.SELECT },
    ),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0, page, limit };
};

export const findById = async (id: number): Promise<Cliente> => {
  const rows = await sequelize.query<Cliente>(
    `SELECT ${BASE_SELECT} FROM MR_CLIENTE WHERE id_cliente = :id AND borrado = 0`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!rows[0]) throw new NotFoundError('Cliente');
  return rows[0];
};

export const buscar = async (q: string): Promise<Cliente[]> => {
  return sequelize.query<Cliente>(
    `SELECT TOP 20 ${BASE_SELECT} FROM MR_CLIENTE
     WHERE borrado = 0 AND activo = 1
       AND (nombre_cliente LIKE :search OR nit = :exacto)
     ORDER BY nombre_cliente`,
    { replacements: { search: `%${q}%`, exacto: q }, type: QueryTypes.SELECT },
  );
};

export const create = async (dto: CreateClienteDto): Promise<Cliente> => {
  if (dto.nit) {
    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_CLIENTE WHERE nit = :nit AND borrado = 0`,
      { replacements: { nit: dto.nit }, type: QueryTypes.SELECT },
    );
    if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('El NIT ya está registrado');
  }

  const result = await sequelize.query<{ id_cliente: number }>(
    `INSERT INTO MR_CLIENTE (nombre_cliente, nit, direccion, telefono, email, usuario_ingreso)
     OUTPUT INSERTED.id_cliente
     VALUES (:nombre, :nit, :dir, :tel, :email, :usuario)`,
    {
      replacements: {
        nombre: dto.nombre_cliente,
        nit: dto.nit ?? null,
        dir: dto.direccion ?? null,
        tel: dto.telefono ?? null,
        email: dto.email ?? null,
        usuario: dto.usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  const id = result[0]?.id_cliente;
  return findById(id);
};

export const update = async (id: number, dto: UpdateClienteDto): Promise<Cliente> => {
  await findById(id);

  if (dto.nit) {
    const exists = await sequelize.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM MR_CLIENTE WHERE nit = :nit AND borrado = 0 AND id_cliente <> :id`,
      { replacements: { nit: dto.nit, id }, type: QueryTypes.SELECT },
    );
    if ((exists[0]?.total ?? 0) > 0) throw new ConflictError('El NIT ya está registrado por otro cliente');
  }

  await sequelize.query(
    `UPDATE MR_CLIENTE SET
       nombre_cliente = COALESCE(:nombre, nombre_cliente),
       nit            = CASE WHEN :nitNull = 1 THEN NULL WHEN :nit IS NOT NULL THEN :nit ELSE nit END,
       direccion      = COALESCE(:dir,    direccion),
       telefono       = COALESCE(:tel,    telefono),
       email          = COALESCE(:email,  email),
       activo         = COALESCE(:activo, activo),
       usuario_actualiza = :usuario,
       fecha_actualiza   = GETDATE()
     WHERE id_cliente = :id AND borrado = 0`,
    {
      replacements: {
        nombre:  dto.nombre_cliente ?? null,
        nit:     dto.nit            ?? null,
        nitNull: dto.nit === null   ? 1 : 0,
        dir:     dto.direccion      ?? null,
        tel:     dto.telefono       ?? null,
        email:   dto.email          ?? null,
        activo:  dto.activo !== undefined ? (dto.activo ? 1 : 0) : null,
        usuario: dto.usuario,
        id,
      },
      type: QueryTypes.UPDATE,
    },
  );

  return findById(id);
};

export const remove = async (id: number, usuario: string): Promise<void> => {
  const cliente = await findById(id);
  if (cliente.es_consumidor_final)
    throw new ConflictError('No se puede eliminar el cliente Consumidor Final');

  await sequelize.query(
    `UPDATE MR_CLIENTE SET borrado = 1, usuario_borrado = :usuario, fecha_borrado = GETDATE()
     WHERE id_cliente = :id`,
    { replacements: { id, usuario }, type: QueryTypes.UPDATE },
  );
};
