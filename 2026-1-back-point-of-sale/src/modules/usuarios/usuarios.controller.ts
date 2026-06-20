import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './usuarios.service';

const createSchema = z.object({
  nombre: z.string().min(1).max(150),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  roles: z.array(z.number().int().positive()).min(1, 'Debe asignar al menos un rol'),
});

const updateSchema = z.object({
  nombre: z.string().min(1).max(150).optional(),
  email: z.string().email().max(200).optional(),
  password: z.string().min(8).max(100).optional(),
  activo: z.boolean().optional(),
  roles: z.array(z.number().int().positive()).optional(),
});

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  sendPaginated(res, await service.findAll(page, limit, offset, search));
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findById(parseInt(req.params.id, 10)));
};

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.getRoles());
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendCreated(res, await service.create({ ...parsed.data, usuario: getUsuario(req) }), 'Usuario creado');
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendOk(res, await service.update(id, { ...parsed.data, usuario: getUsuario(req) }), 'Usuario actualizado');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await service.remove(parseInt(req.params.id, 10), getUsuario(req));
  sendOk(res, null, 'Usuario eliminado');
};
