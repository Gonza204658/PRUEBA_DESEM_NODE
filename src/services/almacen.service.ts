import { Almacen } from '../models';
import { AppError } from './appError';

export interface AlmacenInput {
  nombre: string;
  direccion: string;
}

function normalizeAlmacenInput(input: AlmacenInput): AlmacenInput {
  return { nombre: input.nombre.trim(), direccion: input.direccion.trim() };
}

export class AlmacenService {
  static async create(input: AlmacenInput): Promise<Almacen> {
    return Almacen.create(normalizeAlmacenInput(input));
  }

  static async findAll(): Promise<Almacen[]> {
    return Almacen.findAll({ order: [['id', 'ASC']] });
  }

  static async findById(id: number): Promise<Almacen> {
    const almacen = await Almacen.findByPk(id);
    if (!almacen) {
      throw new AppError('Almacén no encontrado.', 404);
    }

    return almacen;
  }

  static async update(id: number, input: Partial<AlmacenInput>): Promise<Almacen> {
    const almacen = await this.findById(id);
    await almacen.update(normalizeAlmacenInput({
      nombre: input.nombre ?? almacen.nombre,
      direccion: input.direccion ?? almacen.direccion,
    }));
    return almacen;
  }

  static async deactivate(id: number): Promise<Almacen> {
    const almacen = await this.findById(id);
    await almacen.update({ estado: false });
    return almacen;
  }
}