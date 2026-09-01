import { DataTypes, type CreationOptional, type InferAttributes, type InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { EstadoSolicitud } from '../types/database.types';

export class Solicitud extends Model<InferAttributes<Solicitud>, InferCreationAttributes<Solicitud>> {
  declare id: CreationOptional<number>;
  declare clinica_id: number;
  declare usuario_solicitante_id: number;
  declare almacen_asignado_id: number | null;
  declare usuario_asignador_id: number | null;
  declare estado: CreationOptional<EstadoSolicitud>;
  declare fecha_asignacion: Date | null;
  declare observaciones: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Solicitud.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    clinica_id: { type: DataTypes.BIGINT, allowNull: false },
    usuario_solicitante_id: { type: DataTypes.BIGINT, allowNull: false },
    almacen_asignado_id: { type: DataTypes.BIGINT, allowNull: true },
    usuario_asignador_id: { type: DataTypes.BIGINT, allowNull: true },
    estado: { type: DataTypes.ENUM(...Object.values(EstadoSolicitud)), allowNull: false, defaultValue: EstadoSolicitud.PENDIENTE },
    fecha_asignacion: { type: DataTypes.DATE, allowNull: true },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'solicitudes', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' },
);