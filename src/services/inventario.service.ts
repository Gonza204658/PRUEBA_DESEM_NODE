import { Almacen, Inventario, Medicamento } from '../models';
import { AppError } from './appError';

export interface InventarioInput {
  almacen_id: number;
  medicamento_id: number;
  cantidad_disponible: number;
  stock_minimo?: number;
}

export interface InventarioUpdateInput {
  cantidad_disponible?: number;
  stock_minimo?: number;
}

const inventoryInclude = [
  { model: Almacen, as: 'almacen', attributes: ['id', 'nombre', 'direccion', 'estado'] },
  { model: Medicamento, as: 'medicamento', attributes: ['id', 'nombre', 'codigo', 'unidad_medida', 'estado'] },
];

async function validateActiveReferences(almacenId: number, medicamentoId: number): Promise<void> {
  const [almacen, medicamento] = await Promise.all([
    Almacen.findByPk(almacenId),
    Medicamento.findByPk(medicamentoId),
  ]);

  if (!almacen) {
    throw new AppError('Almacén no encontrado.', 404);
  }
  if (!almacen.estado) {
    throw new AppError('El almacén está inactivo.', 400);
  }
  if (!medicamento) {
    throw new AppError('Medicamento no encontrado.', 404);
  }
  if (!medicamento.estado) {
    throw new AppError('El medicamento está inactivo.', 400);
  }
}

export class InventarioService {
  static async create(input: InventarioInput): Promise<Inventario> {
    await validateActiveReferences(input.almacen_id, input.medicamento_id);

    const existingInventory = await Inventario.findOne({
      where: { almacen_id: input.almacen_id, medicamento_id: input.medicamento_id },
    });
    if (existingInventory) {
      throw new AppError('Ya existe inventario para este almacén y medicamento.', 409);
    }

    return Inventario.create(input);
  }

  static async findAll(): Promise<Inventario[]> {
    return Inventario.findAll({ include: inventoryInclude, order: [['id', 'ASC']] });
  }

  static async findById(id: number): Promise<Inventario> {
    const inventario = await Inventario.findByPk(id, { include: inventoryInclude });
    if (!inventario) {
      throw new AppError('Inventario no encontrado.', 404);
    }

    return inventario;
  }

  static async update(id: number, input: InventarioUpdateInput): Promise<Inventario> {
    const inventario = await this.findById(id);
    await inventario.update(input);
    return inventario;
  }
}