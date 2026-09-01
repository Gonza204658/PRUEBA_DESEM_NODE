import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { AppError } from '../services/appError';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  if (error instanceof UniqueConstraintError) {
    response.status(409).json({ success: false, message: 'El registro ya existe.' });
    return;
  }

  if (error instanceof ValidationError) {
    response.status(400).json({ success: false, message: 'Los datos enviados son inválidos.' });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(400).json({ success: false, message: 'No fue posible procesar el archivo enviado.' });
    return;
  }

  if (error instanceof Error && error.message === 'Ruta no encontrada.') {
    response.status(404).json({ success: false, message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ success: false, message: 'Error interno del servidor.' });
};