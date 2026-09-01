import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { AlmacenService, type AlmacenInput } from '../services/almacen.service';

function getPositiveId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('El identificador debe ser un número positivo.', 400);
  }

  return id;
}

function validateAlmacenInput(body: unknown, partial = false): AlmacenInput | Partial<AlmacenInput> {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { nombre, direccion } = body as Record<string, unknown>;
  if (
    (!partial && (typeof nombre !== 'string' || !nombre.trim() || typeof direccion !== 'string' || !direccion.trim())) ||
    (nombre !== undefined && (typeof nombre !== 'string' || !nombre.trim())) ||
    (direccion !== undefined && (typeof direccion !== 'string' || !direccion.trim())) ||
    (partial && nombre === undefined && direccion === undefined)
  ) {
    throw new AppError('Los datos del almacén son inválidos.', 400);
  }

  return {
    ...(typeof nombre === 'string' ? { nombre } : {}),
    ...(typeof direccion === 'string' ? { direccion } : {}),
  } as AlmacenInput | Partial<AlmacenInput>;
}

export class AlmacenController {
  static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const almacen = await AlmacenService.create(validateAlmacenInput(request.body) as AlmacenInput);
      response.status(201).json({ success: true, message: 'Almacén registrado correctamente.', data: almacen });
    } catch (error: unknown) { next(error); }
  }

  static async findAll(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const almacenes = await AlmacenService.findAll();
      response.status(200).json({ success: true, message: 'Almacenes consultados correctamente.', data: almacenes });
    } catch (error: unknown) { next(error); }
  }

  static async findById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const almacen = await AlmacenService.findById(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Almacén consultado correctamente.', data: almacen });
    } catch (error: unknown) { next(error); }
  }

  static async update(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const almacen = await AlmacenService.update(getPositiveId(request.params.id), validateAlmacenInput(request.body, true));
      response.status(200).json({ success: true, message: 'Almacén actualizado correctamente.', data: almacen });
    } catch (error: unknown) { next(error); }
  }

  static async deactivate(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const almacen = await AlmacenService.deactivate(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Almacén desactivado correctamente.', data: almacen });
    } catch (error: unknown) { next(error); }
  }
}