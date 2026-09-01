import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types/database.types';

export const inventarioRouter = Router();

inventarioRouter.use(authenticate, authorize(RolUsuario.ADMINISTRADOR));
inventarioRouter.post('/', InventarioController.create);
inventarioRouter.get('/', InventarioController.findAll);
inventarioRouter.get('/:id', InventarioController.findById);
inventarioRouter.patch('/:id', InventarioController.update);