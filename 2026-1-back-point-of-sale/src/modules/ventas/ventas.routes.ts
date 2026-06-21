import { Router } from 'express';
import * as ctrl from './ventas.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ventas:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('ventas:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('ventas:crear'), asyncHandler(ctrl.create));

export default router;
