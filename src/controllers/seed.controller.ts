import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../services/appError';
import { SeedService } from '../services/seed.service';

export class SeedController {
  static async loadJson(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.file) throw new AppError('Debes adjuntar un archivo JSON en el campo archivo.', 400);
      const result = await SeedService.load(request.file.buffer);
      response.status(201).json({ success: true, message: 'Archivo JSON procesado correctamente.', data: result });
    } catch (error: unknown) { next(error); }
  }
}