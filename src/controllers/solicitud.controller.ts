import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { SolicitudService, type CrearSolicitudInput, type DetalleSolicitudInput } from '../services/solicitud.service';
import { EstadoSolicitud } from '../types/database.types';

function getPositiveId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('El identificador debe ser un número positivo.', 400);
  }

  return id;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function validateDetails(value: unknown): DetalleSolicitudInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError('Debes enviar al menos un detalle de solicitud.', 400);
  }

  const details = value.map((detail) => {
    if (!detail || typeof detail !== 'object') {
      throw new AppError('Los detalles de la solicitud son inválidos.', 400);
    }

    const { medicamento_id, cantidad_solicitada, observaciones } = detail as Record<string, unknown>;
    if (!isPositiveInteger(medicamento_id) || !isPositiveInteger(cantidad_solicitada) ||
      (observaciones !== undefined && typeof observaciones !== 'string')) {
      throw new AppError('Los detalles de la solicitud son inválidos.', 400);
    }

    return {
      medicamento_id,
      cantidad_solicitada,
      ...(typeof observaciones === 'string' ? { observaciones } : {}),
    };
  });

  const medicationIds = new Set(details.map((detail) => detail.medicamento_id));
  if (medicationIds.size !== details.length) {
    throw new AppError('No puedes repetir un medicamento dentro de la misma solicitud.', 400);
  }

  return details;
}

function validateCreateInput(body: unknown): CrearSolicitudInput {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { clinica_id, almacen_asignado_id, observaciones, detalles } = body as Record<string, unknown>;
  if (!isPositiveInteger(clinica_id) || !isPositiveInteger(almacen_asignado_id) ||
    (observaciones !== undefined && typeof observaciones !== 'string')) {
    throw new AppError('Los datos de la solicitud son inválidos.', 400);
  }

  return {
    clinica_id,
    almacen_asignado_id,
    ...(typeof observaciones === 'string' ? { observaciones } : {}),
    detalles: validateDetails(detalles),
  };
}

function validateStateInput(body: unknown): { estado: EstadoSolicitud; observacion?: string } {
  if (!body || typeof body !== 'object') throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  const { estado, observacion } = body as Record<string, unknown>;
  if (!Object.values(EstadoSolicitud).includes(estado as EstadoSolicitud) ||
    (observacion !== undefined && typeof observacion !== 'string')) {
    throw new AppError('El estado de la solicitud es inválido.', 400);
  }

  return { estado: estado as EstadoSolicitud, ...(typeof observacion === 'string' ? { observacion } : {}) };
}

function validateAssignmentInput(body: unknown): { almacen_asignado_id: number; observacion?: string } {
  if (!body || typeof body !== 'object') throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  const { almacen_asignado_id, observacion } = body as Record<string, unknown>;
  if (!isPositiveInteger(almacen_asignado_id) || (observacion !== undefined && typeof observacion !== 'string')) {
    throw new AppError('Los datos de asignación son inválidos.', 400);
  }

  return { almacen_asignado_id, ...(typeof observacion === 'string' ? { observacion } : {}) };
}

export class SolicitudController {
  static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.user) throw new AppError('Token de autenticación requerido.', 401);
      const solicitud = await SolicitudService.create(validateCreateInput(request.body), request.user.id);
      const result = await SolicitudService.findById(Number(solicitud.id));
      response.status(201).json({ success: true, message: 'Solicitud registrada correctamente.', data: result });
    } catch (error: unknown) { next(error); }
  }

  static async findById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const solicitud = await SolicitudService.findById(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Solicitud consultada correctamente.', data: solicitud });
    } catch (error: unknown) { next(error); }
  }

  static async findActive(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const solicitudes = await SolicitudService.findActive();
      response.status(200).json({ success: true, message: 'Solicitudes activas consultadas correctamente.', data: solicitudes });
    } catch (error: unknown) { next(error); }
  }

  static async findHistoryByClinica(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const solicitudes = await SolicitudService.findHistoryByClinica(getPositiveId(request.params.clinicaId));
      response.status(200).json({ success: true, message: 'Historial de la clínica consultado correctamente.', data: solicitudes });
    } catch (error: unknown) { next(error); }
  }

  static async findCompleteHistory(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const solicitudes = await SolicitudService.findCompleteHistory();
      response.status(200).json({ success: true, message: 'Historial completo de solicitudes consultado correctamente.', data: solicitudes });
    } catch (error: unknown) { next(error); }
  }

  static async changeState(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.user) throw new AppError('Token de autenticación requerido.', 401);
      const input = validateStateInput(request.body);
      const solicitud = await SolicitudService.changeState(getPositiveId(request.params.id), input.estado, request.user.id, input.observacion);
      const result = await SolicitudService.findById(Number(solicitud.id));
      response.status(200).json({ success: true, message: 'Estado de la solicitud actualizado correctamente.', data: result });
    } catch (error: unknown) { next(error); }
  }

  static async assign(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.user) throw new AppError('Token de autenticación requerido.', 401);
      const solicitud = await SolicitudService.assign(getPositiveId(request.params.id), validateAssignmentInput(request.body), request.user.id);
      const result = await SolicitudService.findById(Number(solicitud.id));
      response.status(200).json({ success: true, message: 'Solicitud asignada correctamente.', data: result });
    } catch (error: unknown) { next(error); }
  }
}