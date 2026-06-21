import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './inventario.service';

const createSchema = z.object({
  id_producto: z.number().int().positive(),
  id_ubicacion: z.number().int().positive(),
  cantidad_actual: z.number().min(0).optional().default(0),
  stock_minimo: z.number().min(0).optional().default(0),
  observacion: z.string().max(500).optional(),
});

const updateSchema = z.object({
  cantidad_actual: z.number().min(0).optional(),
  stock_minimo: z.number().min(0).optional(),
  tipo_movimiento: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']).optional(),
  cantidad: z.number().positive().optional(),
  observacion: z.string().max(500).optional(),
});

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

const parseOptionalInt = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const id_producto = parseOptionalInt(req.query.id_producto);
  const id_ubicacion = parseOptionalInt(req.query.id_ubicacion);
  const solo_bajo_stock = req.query.solo_bajo_stock === '1';

  sendPaginated(
    res,
    await service.findAll(page, limit, offset, { id_producto, id_ubicacion, solo_bajo_stock }),
  );
};

export const getAlertas = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const soloActivas = req.query.todas !== '1';
  sendPaginated(res, await service.findAlertas(page, limit, offset, soloActivas));
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findById(parseInt(req.params.id, 10)));
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }
  sendCreated(
    res,
    await service.create({ ...parsed.data, usuario: getUsuario(req) }),
    'Inventario registrado',
  );
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }
  sendOk(
    res,
    await service.update(id, { ...parsed.data, usuario: getUsuario(req) }),
    'Inventario actualizado',
  );
};
