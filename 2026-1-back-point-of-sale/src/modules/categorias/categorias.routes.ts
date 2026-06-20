import { Router } from 'express';
import * as ctrl from './categorias.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', authorize('productos:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('productos:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('productos:crear'), asyncHandler(ctrl.create));
router.put('/:id', authorize('productos:editar'), asyncHandler(ctrl.update));
router.delete('/:id', authorize('productos:editar'), asyncHandler(ctrl.remove));

export default router;
