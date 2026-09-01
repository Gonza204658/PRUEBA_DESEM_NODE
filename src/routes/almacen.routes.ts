import { Router } from 'express';
import { AlmacenController } from '../controllers/almacen.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types/database.types';

export const almacenRouter = Router();

almacenRouter.use(authenticate, authorize(RolUsuario.ADMINISTRADOR));
almacenRouter.post('/', AlmacenController.create);
almacenRouter.get('/', AlmacenController.findAll);
almacenRouter.get('/:id', AlmacenController.findById);
almacenRouter.patch('/:id', AlmacenController.update);
almacenRouter.delete('/:id', AlmacenController.deactivate);