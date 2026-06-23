import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './ubicaciones-almacenamiento.service';

const createSchema = z.object({
  estanteria: z.string().min(1).max(50),
  fila: z.string().max(50).optional(),
  caja: z.string().max(50).optional(),
  descripcion: z.string().max(300).optional(),
});

const updateSchema = z.object({
  estanteria: z.string().min(1).max(50).optional(),
  fila: z.string().max(50).nullable().optional(),
  caja: z.string().max(50).nullable().optional(),
  descripcion: z.string().max(300).nullable().optional(),
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

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendCreated(
    res,
    await service.create({ ...parsed.data, usuario: getUsuario(req) }),
    'Ubicacion de almacenamiento creada',
  );
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendOk(
    res,
    await service.update(id, { ...parsed.data, usuario: getUsuario(req) }),
    'Ubicacion de almacenamiento actualizada',
  );
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await service.remove(parseInt(req.params.id, 10), getUsuario(req));
  sendOk(res, null, 'Ubicacion de almacenamiento eliminada');
};
