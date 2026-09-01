import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Clinica extends Model<InferAttributes<Clinica>, InferCreationAttributes<Clinica>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare nit: string;
  declare direccion: string;
  declare telefono: string | null;
  declare email: string | null;
  declare estado: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Clinica.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    nit: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    direccion: { type: DataTypes.STRING(255), allowNull: false },
    telefono: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'clinicas', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);