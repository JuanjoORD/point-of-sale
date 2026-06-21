import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './ventas.service';

const detalleSchema = z.object({
  id_producto: z.number().int().positive(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().min(0).optional(),
  descuento_linea: z.number().min(0).optional(),
});

const createSchema = z.object({
  id_cliente: z.number().int().positive(),
  id_ubicacion: z.number().int().positive(),
  descuento_adicional: z.number().min(0).optional().default(0),
  impuesto_total: z.number().min(0).optional().default(0),
  observaciones: z.string().max(500).optional(),
  detalle: z.array(detalleSchema).min(1),
});

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

const parseOptionalInt = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim();
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  sendPaginated(
    res,
    await service.findAll(page, limit, offset, {
      id_ubicacion: parseOptionalInt(req.query.id_ubicacion),
      id_cliente: parseOptionalInt(req.query.id_cliente),
      fecha_inicio: parseOptionalString(req.query.fecha_inicio),
      fecha_fin: parseOptionalString(req.query.fecha_fin),
      estado: parseOptionalString(req.query.estado),
    }),
  );
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.findById(parseInt(req.params.id, 10)));
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const id_usuario = req.user?.id_usuario;
  if (!id_usuario) {
    throw new ValidationError('Usuario autenticado no disponible');
  }

  sendCreated(
    res,
    await service.create({
      ...parsed.data,
      id_usuario,
      usuario: getUsuario(req),
    }),
    'Venta registrada',
  );
};
