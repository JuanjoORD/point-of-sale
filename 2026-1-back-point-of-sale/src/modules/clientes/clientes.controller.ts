import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './clientes.service';

const createSchema = z.object({
  nombre_cliente: z.string().min(1).max(200),
  nit: z.string().max(50).optional(),
  direccion: z.string().max(300).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email().max(200).optional(),
});

const updateSchema = z.object({
  nombre_cliente: z.string().min(1).max(200).optional(),
  nit: z.string().max(50).nullable().optional(),
  direccion: z.string().max(300).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email().max(200).optional(),
  activo: z.boolean().optional(),
});

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  sendPaginated(res, await service.findAll(page, limit, offset, search));
};

export const buscar = async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) throw new ValidationError('Parámetro q requerido');
  sendOk(res, await service.buscar(q));
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findById(parseInt(req.params.id, 10)));
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendCreated(res, await service.create({ ...parsed.data, usuario: getUsuario(req) }), 'Cliente creado');
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendOk(res, await service.update(id, { ...parsed.data, usuario: getUsuario(req) }), 'Cliente actualizado');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await service.remove(parseInt(req.params.id, 10), getUsuario(req));
  sendOk(res, null, 'Cliente eliminado');
};
