import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Almacen extends Model<InferAttributes<Almacen>, InferCreationAttributes<Almacen>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare direccion: string;
  declare estado: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Almacen.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    direccion: { type: DataTypes.STRING(255), allowNull: false },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'almacenes', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);