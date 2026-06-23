import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../shared/errors/AppError';

export const authorize = (requiredPermission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('No autenticado');
    }

    const permissions = req.user.permisos ?? [];
    const roles = req.user.roles ?? [];

    if (roles.includes('ADMIN') || req.user.es_gestor_seguridad || permissions.includes(requiredPermission)) {
      next();
      return;
    }

    throw new ForbiddenError(`Permiso requerido: ${requiredPermission}`);
  };
};
