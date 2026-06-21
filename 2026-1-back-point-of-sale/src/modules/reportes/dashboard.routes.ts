import { Router } from 'express';
import * as ctrl from './reportes.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.get('/ventas-dia', authorize('reportes:leer'), asyncHandler(ctrl.ventasDia));

export default router;
