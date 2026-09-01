import type { NextFunction, Request, Response } from 'express';
import { AuthService, type LoginInput, type RegisterInput } from '../services/auth.service';
import { AppError } from '../services/appError';
import { RolUsuario } from '../types/database.types';

function validateRegisterInput(body: unknown): RegisterInput {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { nombre, email, password, rol } = body as Record<string, unknown>;
  if (
    typeof nombre !== 'string' || !nombre.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || password.length < 6 ||
    !Object.values(RolUsuario).includes(rol as RolUsuario)
  ) {
    throw new AppError('Los datos de registro son inválidos.', 400);
  }

  return { nombre, email, password, rol: rol as RolUsuario };
}

function validateLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== 'object') {
    throw new AppError('El cuerpo de la solicitud es obligatorio.', 400);
  }

  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw new AppError('El correo electrónico y la contraseña son obligatorios.', 400);
  }

  return { email, password };
}

export class AuthController {
  static async register(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(validateRegisterInput(request.body));
      response.status(201).json({ success: true, message: 'Usuario registrado correctamente.', data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async login(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(validateLoginInput(request.body));
      response.status(200).json({ success: true, message: 'Inicio de sesión exitoso.', data: result });
    } catch (error: unknown) {
      next(error);
    }
  }
}