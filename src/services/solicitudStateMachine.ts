import { EstadoSolicitud } from '../types/database.types';
import { AppError } from './appError';

const allowedTransitions: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  [EstadoSolicitud.PENDIENTE]: [EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA, EstadoSolicitud.CANCELADA],
  [EstadoSolicitud.APROBADA]: [EstadoSolicitud.ASIGNADA, EstadoSolicitud.CANCELADA],
  [EstadoSolicitud.RECHAZADA]: [],
  [EstadoSolicitud.ASIGNADA]: [EstadoSolicitud.DESPACHADA, EstadoSolicitud.CANCELADA],
  [EstadoSolicitud.DESPACHADA]: [EstadoSolicitud.COMPLETADA],
  [EstadoSolicitud.COMPLETADA]: [],
  [EstadoSolicitud.CANCELADA]: [],
};

export function validateSolicitudTransition(currentState: EstadoSolicitud, nextState: EstadoSolicitud): void {
  if (!allowedTransitions[currentState].includes(nextState)) {
    throw new AppError(`No está permitido cambiar una solicitud de ${currentState} a ${nextState}.`, 400);
  }
}