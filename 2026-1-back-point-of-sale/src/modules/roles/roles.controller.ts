import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './roles.service';

const createRolSchema = z.object({
  nombre_rol: z.string().min(1).max(100),
  descripcion: z.string().max(300).optional(),
  permisos: z.array(z.number().int().positive()),
});

const updateRolSchema = createRolSchema.partial();

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  sendPaginated(res, await service.findAllRoles(page, limit, offset));
};

export const getRolById = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findRolById(parseInt(req.params.id, 10)));
};

export const getAllPermisos = async (_req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findAllPermisos());
};

export const createRol = async (req: Request, res: Response): Promise<void> => {
  const parsed = createRolSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendCreated(res, await service.createRol({ ...parsed.data, usuario: getUsuario(req) }), 'Rol creado');
};

export const updateRol = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateRolSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendOk(res, await service.updateRol(id, { ...parsed.data, usuario: getUsuario(req) }), 'Rol actualizado');
};

export const removeRol = async (req: Request, res: Response): Promise<void> => {
  await service.removeRol(parseInt(req.params.id, 10), getUsuario(req));
  sendOk(res, null, 'Rol eliminado');
};
