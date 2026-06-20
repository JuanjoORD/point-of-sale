import { Router } from 'express';
import * as ctrl from './usuarios.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/roles-disponibles', authorize('usuarios:leer'), asyncHandler(ctrl.getRoles));
router.get('/', authorize('usuarios:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('usuarios:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('usuarios:crear'), asyncHandler(ctrl.create));
router.put('/:id', authorize('usuarios:editar'), asyncHandler(ctrl.update));
router.delete('/:id', authorize('usuarios:editar'), asyncHandler(ctrl.remove));

export default router;
