import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/environment';
import { UnauthorizedError } from '../shared/errors/AppError';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de acceso requerido');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as unknown;
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('type' in payload) ||
      !('id_usuario' in payload)
    ) {
      throw new UnauthorizedError('Token inválido o incompleto');
    }

    const parsed = payload as Express.UserJwtPayload;

    if (parsed.type !== 'access') {
      throw new UnauthorizedError('Token inválido para este endpoint');
    }

    req.user = parsed;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
};
