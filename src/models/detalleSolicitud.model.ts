import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class DetalleSolicitud extends Model<InferAttributes<DetalleSolicitud>, InferCreationAttributes<DetalleSolicitud>> {
  declare id: CreationOptional<number>;
  declare solicitud_id: number;
  declare medicamento_id: number;
  declare cantidad_solicitada: number;
  declare cantidad_aprobada: number | null;
  declare cantidad_entregada: number | null;
  declare observaciones: string | null;
}

DetalleSolicitud.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    solicitud_id: { type: DataTypes.BIGINT, allowNull: false },
    medicamento_id: { type: DataTypes.BIGINT, allowNull: false },
    cantidad_solicitada: { type: DataTypes.INTEGER, allowNull: false },
    cantidad_aprobada: { type: DataTypes.INTEGER, allowNull: true },
    cantidad_entregada: { type: DataTypes.INTEGER, allowNull: true },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'detalle_solicitudes', timestamps: false },
);