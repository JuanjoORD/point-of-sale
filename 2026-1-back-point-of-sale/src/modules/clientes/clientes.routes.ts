import { Router } from 'express';
import * as ctrl from './clientes.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/buscar', authorize('clientes:leer'), asyncHandler(ctrl.buscar));
router.get('/', authorize('clientes:leer'), asyncHandler(ctrl.getAll));
router.get('/:id', authorize('clientes:leer'), asyncHandler(ctrl.getById));
router.post('/', authorize('clientes:crear'), asyncHandler(ctrl.create));
router.put('/:id', authorize('clientes:editar'), asyncHandler(ctrl.update));
router.delete('/:id', authorize('clientes:editar'), asyncHandler(ctrl.remove));

export default router;
