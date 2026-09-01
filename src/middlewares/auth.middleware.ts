import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { Usuario } from '../models';
import { RolUsuario } from '../types/database.types';
import { AppError } from '../services/appError';

interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
  rol: RolUsuario;
}

function isTokenPayload(payload: string | JwtPayload): payload is TokenPayload {
  return typeof payload !== 'string' &&
    typeof payload.id === 'number' &&
    typeof payload.email === 'string' &&
    Object.values(RolUsuario).includes(payload.rol as RolUsuario);
}

export async function authenticate(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Token de autenticación requerido.', 401);
    }

    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, env.jwt.secret);
    if (!isTokenPayload(payload)) {
      throw new AppError('Token de autenticación inválido.', 401);
    }

    const user = await Usuario.findByPk(payload.id);
    if (!user || !user.estado) {
      throw new AppError('Usuario no autorizado o inactivo.', 401);
    }

    request.user = { id: Number(user.id), email: user.email, rol: user.rol };
    next();
  } catch (error: unknown) {
    next(error instanceof jwt.JsonWebTokenError ? new AppError('Token de autenticación inválido o vencido.', 401) : error);
  }
}

export function authorize(...roles: RolUsuario[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user || !roles.includes(request.user.rol)) {
      next(new AppError('No tienes permisos para realizar esta acción.', 403));
      return;
    }

    next();
  };
}