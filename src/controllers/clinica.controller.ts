import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { ClinicaService, type ClinicaInput, type ResponsableInput } from '../services/clinica.service';

function getPositiveId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('El identificador debe ser un número positivo.', 400);
  }

  return id;
}

function validateClinicaInput(body: unknown, partial = false): ClinicaInput | Partial<ClinicaInput> {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { nombre, nit, direccion, telefono, email } = body as Record<string, unknown>;
  const values = { nombre, nit, direccion, telefono, email };
  const requiredValues = [nombre, nit, direccion];
  if ((!partial && requiredValues.some((value) => typeof value !== 'string' || !value.trim())) ||
    Object.values(values).some((value) => value !== undefined && typeof value !== 'string')) {
    throw new AppError('Los datos de la clínica son inválidos.', 400);
  }

  if (partial && !Object.values(values).some((value) => value !== undefined)) {
    throw new AppError('Debes enviar al menos un campo para actualizar.', 400);
  }

  return {
    ...(typeof nombre === 'string' ? { nombre } : {}),
    ...(typeof nit === 'string' ? { nit } : {}),
    ...(typeof direccion === 'string' ? { direccion } : {}),
    ...(typeof telefono === 'string' ? { telefono } : {}),
    ...(typeof email === 'string' ? { email } : {}),
  } as ClinicaInput | Partial<ClinicaInput>;
}

function validateResponsableInput(body: unknown): ResponsableInput {
  if (!body || typeof body !== 'object') {
    throw new AppError('usuario_id debe ser un número entero positivo.', 400);
  }

  const usuarioId = (body as Record<string, unknown>).usuario_id;
  if (typeof usuarioId !== 'number' || !Number.isSafeInteger(usuarioId) || usuarioId < 1) {
    throw new AppError('usuario_id debe ser un número entero positivo.', 400);
  }

  return { usuario_id: usuarioId };
}

export class ClinicaController {
  static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const clinica = await ClinicaService.create(validateClinicaInput(request.body) as ClinicaInput);
      response.status(201).json({ success: true, message: 'Clínica registrada correctamente.', data: clinica });
    } catch (error: unknown) { next(error); }
  }

  static async findAll(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const clinicas = await ClinicaService.findAll();
      response.status(200).json({ success: true, message: 'Clínicas consultadas correctamente.', data: clinicas });
    } catch (error: unknown) { next(error); }
  }

  static async findById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const clinica = await ClinicaService.findById(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Clínica consultada correctamente.', data: clinica });
    } catch (error: unknown) { next(error); }
  }

  static async update(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const clinica = await ClinicaService.update(getPositiveId(request.params.id), validateClinicaInput(request.body, true));
      response.status(200).json({ success: true, message: 'Clínica actualizada correctamente.', data: clinica });
    } catch (error: unknown) { next(error); }
  }

  static async deactivate(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const clinica = await ClinicaService.deactivate(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Clínica desactivada correctamente.', data: clinica });
    } catch (error: unknown) { next(error); }
  }

  static async assignResponsable(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await ClinicaService.assignResponsable(getPositiveId(request.params.id), validateResponsableInput(request.body));
      response.status(201).json({ success: true, message: 'Responsable asignado correctamente.', data: assignment });
    } catch (error: unknown) { next(error); }
  }
}