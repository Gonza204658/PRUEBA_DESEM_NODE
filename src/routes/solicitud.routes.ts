import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitud.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RolUsuario } from '../types/database.types';

export const solicitudRouter = Router();

solicitudRouter.use(authenticate);
solicitudRouter.post('/', authorize(RolUsuario.ADMINISTRADOR, RolUsuario.GESTOR_SOLICITUDES), SolicitudController.create);
solicitudRouter.get('/activas', SolicitudController.findActive);
solicitudRouter.get('/clinica/:clinicaId/historial', SolicitudController.findHistoryByClinica);
solicitudRouter.get('/historial-completo', authorize(RolUsuario.ADMINISTRADOR, RolUsuario.GESTOR_SOLICITUDES), SolicitudController.findCompleteHistory);
solicitudRouter.patch('/:id/estado', authorize(RolUsuario.ADMINISTRADOR, RolUsuario.GESTOR_SOLICITUDES), SolicitudController.changeState);
solicitudRouter.patch('/:id/asignar', authorize(RolUsuario.ADMINISTRADOR, RolUsuario.GESTOR_SOLICITUDES), SolicitudController.assign);
solicitudRouter.get('/:id', SolicitudController.findById);