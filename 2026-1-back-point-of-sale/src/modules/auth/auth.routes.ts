import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/perfil', authenticate, asyncHandler(authController.profile));
router.get(
	'/permiso-prueba',
	authenticate,
	authorize('reportes:leer'),
	asyncHandler(authController.permissionProbe),
);

export default router;
