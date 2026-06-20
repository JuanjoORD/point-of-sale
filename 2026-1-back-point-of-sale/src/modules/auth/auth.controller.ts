import { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';
import * as authService from './auth.service';

const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(200),
  password: z.string().min(6, 'Contraseña demasiado corta').max(200),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token requerido'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { email, password } = parsed.data;
  const result = await authService.login(email.trim().toLowerCase(), password);

  res.status(200).json(result);
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const result = await authService.refresh(parsed.data.refresh_token);
  res.status(200).json(result);
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  await authService.logout();
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id_usuario) {
    throw new ValidationError('Usuario autenticado no disponible');
  }

  const user = await authService.getProfile(req.user.id_usuario);
  res.status(200).json({ user });
};

export const permissionProbe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: 'Permiso validado correctamente',
    user: {
      id_usuario: req.user?.id_usuario,
      email: req.user?.email,
    },
  });
};
