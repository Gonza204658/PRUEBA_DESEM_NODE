import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { MedicamentoService, type MedicamentoInput } from '../services/medicamento.service';

function getPositiveId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('El identificador debe ser un número positivo.', 400);
  }

  return id;
}

function validateMedicamentoInput(body: unknown, partial = false): MedicamentoInput | Partial<MedicamentoInput> {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { nombre, codigo, descripcion, presentacion, unidad_medida } = body as Record<string, unknown>;
  const values = { nombre, codigo, descripcion, presentacion, unidad_medida };
  const requiredValues = [nombre, codigo, unidad_medida];
  if (
    (!partial && requiredValues.some((value) => typeof value !== 'string' || !value.trim())) ||
    Object.values(values).some((value) => value !== undefined && typeof value !== 'string') ||
    (partial && !Object.values(values).some((value) => value !== undefined))
  ) {
    throw new AppError('Los datos del medicamento son inválidos.', 400);
  }

  return {
    ...(typeof nombre === 'string' ? { nombre } : {}),
    ...(typeof codigo === 'string' ? { codigo } : {}),
    ...(typeof descripcion === 'string' ? { descripcion } : {}),
    ...(typeof presentacion === 'string' ? { presentacion } : {}),
    ...(typeof unidad_medida === 'string' ? { unidad_medida } : {}),
  } as MedicamentoInput | Partial<MedicamentoInput>;
}

export class MedicamentoController {
  static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const medicamento = await MedicamentoService.create(validateMedicamentoInput(request.body) as MedicamentoInput);
      response.status(201).json({ success: true, message: 'Medicamento registrado correctamente.', data: medicamento });
    } catch (error: unknown) { next(error); }
  }

  static async findAll(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const medicamentos = await MedicamentoService.findAll();
      response.status(200).json({ success: true, message: 'Medicamentos consultados correctamente.', data: medicamentos });
    } catch (error: unknown) { next(error); }
  }

  static async findById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const medicamento = await MedicamentoService.findById(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Medicamento consultado correctamente.', data: medicamento });
    } catch (error: unknown) { next(error); }
  }

  static async update(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const medicamento = await MedicamentoService.update(getPositiveId(request.params.id), validateMedicamentoInput(request.body, true));
      response.status(200).json({ success: true, message: 'Medicamento actualizado correctamente.', data: medicamento });
    } catch (error: unknown) { next(error); }
  }

  static async deactivate(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const medicamento = await MedicamentoService.deactivate(getPositiveId(request.params.id));
      response.status(200).json({ success: true, message: 'Medicamento desactivado correctamente.', data: medicamento });
    } catch (error: unknown) { next(error); }
  }
}