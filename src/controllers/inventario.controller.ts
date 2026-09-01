import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { InventarioService, type InventarioInput, type InventarioUpdateInput } from '../services/inventario.service';

function getPositiveId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('El identificador debe ser un número positivo.', 400);
  }

  return id;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function validateInventarioInput(body: unknown, partial = false): InventarioInput | InventarioUpdateInput {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { almacen_id, medicamento_id, cantidad_disponible, stock_minimo } = body as Record<string, unknown>;
  if (!partial) {
    if (!Number.isSafeInteger(almacen_id) || (almacen_id as number) < 1 ||
      !Number.isSafeInteger(medicamento_id) || (medicamento_id as number) < 1 ||
      !isNonNegativeInteger(cantidad_disponible) ||
      (stock_minimo !== undefined && !isNonNegativeInteger(stock_minimo))) {
      throw new AppError('Los datos del inventario son inválidos.', 400);
    }

    return {
      almacen_id: almacen_id as number,
      medicamento_id: medicamento_id as number,
      cantidad_disponible,
      ...(stock_minimo !== undefined ? { stock_minimo } : {}),
    };
  }

  if ((cantidad_disponible === undefined && stock_minimo === undefined) ||
    (cantidad_disponible !== undefined && !isNonNegativeInteger(cantidad_disponible)) ||
    (stock_minimo !== undefined && !isNonNegativeInteger(stock_minimo))) {
    throw new AppError('Debes enviar cantidades enteras mayores o iguales a cero.', 400);
  }

  return {
    ...(cantidad_disponible !== undefined ? { cantidad_disponible } : {}),
    ...(stock_minimo !== undefined ? { stock_minimo } : {}),
  };
}

export class InventarioController {
  static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const inventario = await InventarioService.create(validateInventarioInput(request.body) as InventarioInput);
      response.status(201).json({ success: true, message: 'Inventario registrado correctamente.', data: inventario });
    } catch (error: unknown) { next(error); }
  }

  static async findAll(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const inventarios = await InventarioService.findAll();
      response.status(200).json({ success: true, message: 'Inventarios consultados correctamente.', data: inventarios });
    } catch (error: unknown) { next(error); }
  }

  static async findById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const inventario = await InventarioService.findById(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Inventario consultado correctamente.', data: inventario });
    } catch (error: unknown) { next(error); }
  }

  static async update(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const inventario = await InventarioService.update(getPositiveId(request.params.id), validateInventarioInput(request.body, true) as InventarioUpdateInput);
      response.status(200).json({ success: true, message: 'Inventario actualizado correctamente.', data: inventario });
    } catch (error: unknown) { next(error); }
  }
}