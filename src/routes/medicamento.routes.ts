import { Router } from 'express';
import { MedicamentoController } from '../controllers/medicamento.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types/database.types';

export const medicamentoRouter = Router();

medicamentoRouter.use(authenticate, authorize(RolUsuario.ADMINISTRADOR));
medicamentoRouter.post('/', MedicamentoController.create);
medicamentoRouter.get('/', MedicamentoController.findAll);
medicamentoRouter.get('/:id', MedicamentoController.findById);
medicamentoRouter.patch('/:id', MedicamentoController.update);
medicamentoRouter.delete('/:id', MedicamentoController.deactivate);