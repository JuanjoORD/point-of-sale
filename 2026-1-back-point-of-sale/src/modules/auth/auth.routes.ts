import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticacion, intenta mas tarde.' },
});

router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/refresh', authLimiter, asyncHandler(authController.refresh));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/perfil', authenticate, asyncHandler(authController.profile));
router.put('/perfil', authenticate, asyncHandler(authController.updateProfile));
router.get(
	'/permiso-prueba',
	authenticate,
	authorize('reportes:leer'),
	asyncHandler(authController.permissionProbe),
);

export default router;
