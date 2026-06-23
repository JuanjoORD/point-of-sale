import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import { sendOk, sendCreated, sendPaginated, parsePagination } from '../../shared/utils/response';
import * as service from './productos.service';

const createSchema = z.object({
  nombre_producto: z.string().min(1).max(200),
  descripcion: z.string().max(500).optional(),
  codigo_barras: z.string().max(100).optional(),
  precio_costo: z.number().min(0),
  precio_venta: z.number().min(0),
  es_servicio: z.boolean().optional().default(false),
  id_categoria: z.number().int().positive().optional(),
  id_ubicacion_almacenamiento: z.number().int().positive().optional(),
});

const updateSchema = z.object({
  nombre_producto: z.string().min(1).max(200).optional(),
  descripcion: z.string().max(500).optional(),
  codigo_barras: z.string().max(100).nullable().optional(),
  precio_costo: z.number().min(0).optional(),
  precio_venta: z.number().min(0).optional(),
  es_servicio: z.boolean().optional(),
  id_categoria: z.number().int().positive().nullable().optional(),
  id_ubicacion_almacenamiento: z.number().int().positive().nullable().optional(),
  activo: z.boolean().optional(),
});

const getUsuario = (req: Request): string => req.user?.email ?? 'sistema';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const soloActivos = req.query.todos !== '1';
  sendPaginated(res, await service.findAll(page, limit, offset, search, soloActivos));
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
  sendCreated(res, await service.create({ ...parsed.data, usuario: getUsuario(req) }), 'Producto creado');
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  sendOk(res, await service.update(id, { ...parsed.data, usuario: getUsuario(req) }), 'Producto actualizado');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await service.remove(parseInt(req.params.id, 10), getUsuario(req));
  sendOk(res, null, 'Producto eliminado');
};
