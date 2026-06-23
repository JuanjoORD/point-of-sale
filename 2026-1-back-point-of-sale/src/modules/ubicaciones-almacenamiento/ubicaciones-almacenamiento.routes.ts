import { Router } from 'express';
import * as ctrl from './ubicaciones-almacenamiento.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', authorize('inventario:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('inventario:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('inventario:editar'), asyncHandler(ctrl.create));
router.put('/:id', authorize('inventario:editar'), asyncHandler(ctrl.update));
router.delete('/:id', authorize('inventario:editar'), asyncHandler(ctrl.remove));

export default router;
