import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Medicamento extends Model<InferAttributes<Medicamento>, InferCreationAttributes<Medicamento>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare codigo: string;
  declare descripcion: string | null;
  declare presentacion: string | null;
  declare unidad_medida: string;
  declare estado: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Medicamento.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    presentacion: { type: DataTypes.STRING(100), allowNull: true },
    unidad_medida: { type: DataTypes.STRING(30), allowNull: false },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'medicamentos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);