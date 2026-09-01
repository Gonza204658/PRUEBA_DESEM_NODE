import type { RolUsuario } from './database.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        rol: RolUsuario;
      };
    }
  }
}

export {};