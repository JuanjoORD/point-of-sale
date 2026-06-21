import { Router } from 'express';
import * as ctrl from './inventario.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/alertas', authorize('inventario:leer'), asyncHandler(ctrl.getAlertas));
router.get('/', authorize('inventario:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('inventario:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('inventario:editar'), asyncHandler(ctrl.create));
router.put('/:id', authorize('inventario:editar'), asyncHandler(ctrl.update));

export default router;
