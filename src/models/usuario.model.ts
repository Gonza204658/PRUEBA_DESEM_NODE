import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { RolUsuario } from '../types/database.types';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string;
  declare password_hash: string;
  declare rol: CreationOptional<RolUsuario>;
  declare estado: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Usuario.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.ENUM(...Object.values(RolUsuario)), allowNull: false, defaultValue: RolUsuario.GESTOR_SOLICITUDES },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'usuarios', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);