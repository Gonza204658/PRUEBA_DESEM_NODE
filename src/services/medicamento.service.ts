import { Medicamento } from '../models';
import { AppError } from './appError';

export interface MedicamentoInput {
  nombre: string;
  codigo: string;
  descripcion?: string;
  presentacion?: string;
  unidad_medida: string;
}

function normalizeMedicamentoInput(input: MedicamentoInput): MedicamentoInput {
  return {
    nombre: input.nombre.trim(),
    codigo: input.codigo.trim().toUpperCase(),
    unidad_medida: input.unidad_medida.trim(),
    ...(input.descripcion ? { descripcion: input.descripcion.trim() } : {}),
    ...(input.presentacion ? { presentacion: input.presentacion.trim() } : {}),
  };
}

export class MedicamentoService {
  static async create(input: MedicamentoInput): Promise<Medicamento> {
    const medicationData = normalizeMedicamentoInput(input);
    const existingMedication = await Medicamento.findOne({ where: { codigo: medicationData.codigo } });
    if (existingMedication) {
      throw new AppError('Ya existe un medicamento con este código.', 409);
    }

    return Medicamento.create(medicationData);
  }

  static async findAll(): Promise<Medicamento[]> {
    return Medicamento.findAll({ order: [['id', 'ASC']] });
  }

  static async findById(id: number): Promise<Medicamento> {
    const medicamento = await Medicamento.findByPk(id);
    if (!medicamento) {
      throw new AppError('Medicamento no encontrado.', 404);
    }

    return medicamento;
  }

  static async update(id: number, input: Partial<MedicamentoInput>): Promise<Medicamento> {
    const medicamento = await this.findById(id);
    const medicationData = normalizeMedicamentoInput({
      nombre: input.nombre ?? medicamento.nombre,
      codigo: input.codigo ?? medicamento.codigo,
      unidad_medida: input.unidad_medida ?? medicamento.unidad_medida,
      ...(input.descripcion !== undefined ? { descripcion: input.descripcion } : {}),
      ...(input.presentacion !== undefined ? { presentacion: input.presentacion } : {}),
    });

    if (medicationData.codigo !== medicamento.codigo) {
      const existingMedication = await Medicamento.findOne({ where: { codigo: medicationData.codigo } });
      if (existingMedication) {
        throw new AppError('Ya existe un medicamento con este código.', 409);
      }
    }

    await medicamento.update(medicationData);
    return medicamento;
  }

  static async deactivate(id: number): Promise<Medicamento> {
    const medicamento = await this.findById(id);
    await medicamento.update({ estado: false });
    return medicamento;
  }
}