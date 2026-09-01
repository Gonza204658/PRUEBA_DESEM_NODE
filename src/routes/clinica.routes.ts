import { Router } from 'express';
import { ClinicaController } from '../controllers/clinica.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types/database.types';

export const clinicaRouter = Router();

clinicaRouter.use(authenticate, authorize(RolUsuario.ADMINISTRADOR));
clinicaRouter.post('/', ClinicaController.create);
clinicaRouter.get('/', ClinicaController.findAll);
clinicaRouter.get('/:id', ClinicaController.findById);
clinicaRouter.patch('/:id', ClinicaController.update);
clinicaRouter.delete('/:id', ClinicaController.deactivate);
clinicaRouter.post('/:id/responsables', ClinicaController.assignResponsable);