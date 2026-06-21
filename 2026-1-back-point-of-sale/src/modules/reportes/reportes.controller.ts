import { Request, Response } from 'express';
import { sendOk } from '../../shared/utils/response';
import * as service from './reportes.service';

export const ventasDia = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.getVentasDia(service.parseReporteFilters(req.query as Record<string, unknown>)));
};

export const ventasRango = async (req: Request, res: Response): Promise<void> => {
  sendOk(res, await service.getVentasRango(service.parseReporteFilters(req.query as Record<string, unknown>)));
};

export const topProductosCantidad = async (req: Request, res: Response): Promise<void> => {
  sendOk(
    res,
    await service.getTopProductosCantidad(
      service.parseReporteFilters(req.query as Record<string, unknown>),
    ),
  );
};

export const topProductosValor = async (req: Request, res: Response): Promise<void> => {
  sendOk(
    res,
    await service.getTopProductosValor(
      service.parseReporteFilters(req.query as Record<string, unknown>),
    ),
  );
};
