import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { EstadoSolicitud } from '../types/database.types';

export class HistorialSolicitud extends Model<InferAttributes<HistorialSolicitud>, InferCreationAttributes<HistorialSolicitud>> {
  declare id: CreationOptional<number>;
  declare solicitud_id: number;
  declare estado_anterior: EstadoSolicitud | null;
  declare estado_nuevo: EstadoSolicitud;
  declare usuario_id: number;
  declare fecha_cambio: CreationOptional<Date>;
  declare observacion: string | null;
}

HistorialSolicitud.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    solicitud_id: { type: DataTypes.BIGINT, allowNull: false },
    estado_anterior: { type: DataTypes.ENUM(...Object.values(EstadoSolicitud)), allowNull: true },
    estado_nuevo: { type: DataTypes.ENUM(...Object.values(EstadoSolicitud)), allowNull: false },
    usuario_id: { type: DataTypes.BIGINT, allowNull: false },
    fecha_cambio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    observacion: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'historial_solicitudes', timestamps: false },
);