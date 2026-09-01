import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { Usuario } from '../models';
import { RolUsuario } from '../types/database.types';
import { env } from '../config/env';
import { AppError } from './appError';

const PASSWORD_SALT_ROUNDS = 10;

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

function serializeUser(user: Usuario): AuthenticatedUser {
  return {
    id: Number(user.id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
  };
}

function createToken(user: Usuario): string {
  return jwt.sign(
    { id: Number(user.id), email: user.email, rol: user.rol },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn as StringValue },
  );
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await Usuario.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado.', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const user = await Usuario.create({
      nombre: input.nombre.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      rol: input.rol,
    });

    return { user: serializeUser(user), token: createToken(user) };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const user = await Usuario.findOne({ where: { email: input.email.trim().toLowerCase() } });

    if (!user || !user.estado) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    return { user: serializeUser(user), token: createToken(user) };
  }
}