import { Router } from 'express';
import * as ctrl from './roles.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/permisos', authorize('roles:leer'), asyncHandler(ctrl.getAllPermisos));
router.get('/', authorize('roles:leer'), asyncHandler(ctrl.getAllRoles));
router.get('/:id', authorize('roles:leer'), asyncHandler(ctrl.getRolById));
router.post('/', authorize('roles:crear'), asyncHandler(ctrl.createRol));
router.put('/:id', authorize('roles:editar'), asyncHandler(ctrl.updateRol));
router.delete('/:id', authorize('roles:editar'), asyncHandler(ctrl.removeRol));

export default router;
