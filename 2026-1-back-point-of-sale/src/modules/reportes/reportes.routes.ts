import { Router } from 'express';
import * as ctrl from './reportes.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.get('/ventas', authorize('reportes:leer'), asyncHandler(ctrl.ventasRango));
router.get('/top-productos-cantidad', authorize('reportes:leer'), asyncHandler(ctrl.topProductosCantidad));
router.get('/top-productos-valor', authorize('reportes:leer'), asyncHandler(ctrl.topProductosValor));

export default router;
