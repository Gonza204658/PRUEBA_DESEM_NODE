import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Inventario extends Model<InferAttributes<Inventario>, InferCreationAttributes<Inventario>> {
  declare id: CreationOptional<number>;
  declare almacen_id: number;
  declare medicamento_id: number;
  declare cantidad_disponible: CreationOptional<number>;
  declare stock_minimo: CreationOptional<number | null>;
  declare updated_at: CreationOptional<Date>;
}

Inventario.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    almacen_id: { type: DataTypes.BIGINT, allowNull: false },
    medicamento_id: { type: DataTypes.BIGINT, allowNull: false },
    cantidad_disponible: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    stock_minimo: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'inventarios', timestamps: true, createdAt: false, updatedAt: 'updated_at' },
);