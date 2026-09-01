import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ClinicaResponsable extends Model<InferAttributes<ClinicaResponsable>, InferCreationAttributes<ClinicaResponsable>> {
  declare id: CreationOptional<number>;
  declare clinica_id: number;
  declare usuario_id: number;
  declare fecha_asignacion: CreationOptional<Date>;
  declare estado: CreationOptional<boolean>;
}

ClinicaResponsable.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    clinica_id: { type: DataTypes.BIGINT, allowNull: false },
    usuario_id: { type: DataTypes.BIGINT, allowNull: false },
    fecha_asignacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: 'clinica_responsables', timestamps: false },
);