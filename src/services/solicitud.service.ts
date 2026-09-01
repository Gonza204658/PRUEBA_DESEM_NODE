import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Almacen, Clinica, DetalleSolicitud, HistorialSolicitud, Inventario, Medicamento, Solicitud, Usuario } from '../models';
import { EstadoSolicitud } from '../types/database.types';
import { AppError } from './appError';
import { validateSolicitudTransition } from './solicitudStateMachine';

export interface DetalleSolicitudInput {
  medicamento_id: number;
  cantidad_solicitada: number;
  observaciones?: string;
}

export interface CrearSolicitudInput {
  clinica_id: number;
  almacen_asignado_id: number;
  observaciones?: string;
  detalles: DetalleSolicitudInput[];
}

export interface AsignarSolicitudInput {
  almacen_asignado_id: number;
  observacion?: string;
}

const solicitudInclude = [
  { model: Clinica, as: 'clinica', attributes: ['id', 'nombre', 'nit', 'estado'] },
  { model: Usuario, as: 'usuario_solicitante', attributes: ['id', 'nombre', 'email', 'rol'] },
  { model: Usuario, as: 'usuario_asignador', attributes: ['id', 'nombre', 'email', 'rol'] },
  { model: Almacen, as: 'almacen_asignado', attributes: ['id', 'nombre', 'direccion', 'estado'] },
  { model: DetalleSolicitud, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento', attributes: ['id', 'nombre', 'codigo', 'unidad_medida'] }] },
  { model: HistorialSolicitud, as: 'historial', include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }] },
];

function groupRequestedQuantities(details: DetalleSolicitudInput[]): Map<number, number> {
  const quantities = new Map<number, number>();
  for (const detail of details) {
    quantities.set(detail.medicamento_id, (quantities.get(detail.medicamento_id) ?? 0) + detail.cantidad_solicitada);
  }

  return quantities;
}

export class SolicitudService {
  static async create(input: CrearSolicitudInput, usuarioSolicitanteId: number): Promise<Solicitud> {
    return sequelize.transaction(async (transaction) => {
      const [clinica, almacen, usuario] = await Promise.all([
        Clinica.findByPk(input.clinica_id, { transaction }),
        Almacen.findByPk(input.almacen_asignado_id, { transaction }),
        Usuario.findByPk(usuarioSolicitanteId, { transaction }),
      ]);

      if (!clinica) throw new AppError('Clínica no encontrada.', 404);
      if (!clinica.estado) throw new AppError('La clínica está inactiva.', 400);
      if (!almacen) throw new AppError('Almacén no encontrado.', 404);
      if (!almacen.estado) throw new AppError('El almacén está inactivo.', 400);
      if (!usuario || !usuario.estado) throw new AppError('El usuario solicitante no está activo.', 400);

      const requestedQuantities = groupRequestedQuantities(input.detalles);
      const medicationIds = [...requestedQuantities.keys()];
      const medications = await Medicamento.findAll({ where: { id: medicationIds }, transaction });
      if (medications.length !== medicationIds.length || medications.some((medication) => !medication.estado)) {
        throw new AppError('Todos los medicamentos deben existir y estar activos.', 400);
      }

      for (const [medicamentoId, requestedQuantity] of requestedQuantities) {
        const inventario = await Inventario.findOne({
          where: { almacen_id: input.almacen_asignado_id, medicamento_id: medicamentoId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!inventario || inventario.cantidad_disponible < requestedQuantity) {
          throw new AppError('El medicamento no tiene inventario suficiente.', 400);
        }
      }

      const solicitud = await Solicitud.create({
        clinica_id: input.clinica_id,
        usuario_solicitante_id: usuarioSolicitanteId,
        almacen_asignado_id: input.almacen_asignado_id,
        ...(input.observaciones ? { observaciones: input.observaciones.trim() } : {}),
      }, { transaction });

      await DetalleSolicitud.bulkCreate(input.detalles.map((detail) => ({
        solicitud_id: solicitud.id,
        medicamento_id: detail.medicamento_id,
        cantidad_solicitada: detail.cantidad_solicitada,
        ...(detail.observaciones ? { observaciones: detail.observaciones.trim() } : {}),
      })), { transaction });

      return solicitud;
    });
  }

  static async findById(id: number): Promise<Solicitud> {
    const solicitud = await Solicitud.findByPk(id, { include: solicitudInclude });
    if (!solicitud) {
      throw new AppError('Solicitud no encontrada.', 404);
    }

    return solicitud;
  }

  static async findActive(): Promise<Solicitud[]> {
    return Solicitud.findAll({
      where: { estado: { [Op.notIn]: [EstadoSolicitud.RECHAZADA, EstadoSolicitud.COMPLETADA, EstadoSolicitud.CANCELADA] } },
      include: solicitudInclude,
      order: [['created_at', 'DESC']],
    });
  }

  static async findHistoryByClinica(clinicaId: number): Promise<Solicitud[]> {
    const clinica = await Clinica.findByPk(clinicaId);
    if (!clinica) {
      throw new AppError('Clínica no encontrada.', 404);
    }

    return Solicitud.findAll({
      where: { clinica_id: clinicaId },
      include: solicitudInclude,
      order: [['created_at', 'DESC']],
    });
  }

  static async findCompleteHistory(): Promise<Solicitud[]> {
    return Solicitud.findAll({ include: solicitudInclude, order: [['created_at', 'DESC']] });
  }

  static async changeState(id: number, nextState: EstadoSolicitud, usuarioId: number, observacion?: string): Promise<Solicitud> {
    if (nextState === EstadoSolicitud.ASIGNADA) {
      throw new AppError('Usa la asignación de almacén para cambiar el estado a ASIGNADA.', 400);
    }

    return sequelize.transaction(async (transaction) => {
      const solicitud = await Solicitud.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!solicitud) throw new AppError('Solicitud no encontrada.', 404);

      validateSolicitudTransition(solicitud.estado, nextState);
      const previousState = solicitud.estado;
      await solicitud.update({ estado: nextState }, { transaction });
      await HistorialSolicitud.create({
        solicitud_id: solicitud.id,
        estado_anterior: previousState,
        estado_nuevo: nextState,
        usuario_id: usuarioId,
        ...(observacion ? { observacion: observacion.trim() } : {}),
      }, { transaction });

      return solicitud;
    });
  }

  static async assign(id: number, input: AsignarSolicitudInput, usuarioAsignadorId: number): Promise<Solicitud> {
    return sequelize.transaction(async (transaction) => {
      const solicitud = await Solicitud.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!solicitud) throw new AppError('Solicitud no encontrada.', 404);

      validateSolicitudTransition(solicitud.estado, EstadoSolicitud.ASIGNADA);
      const almacen = await Almacen.findByPk(input.almacen_asignado_id, { transaction });
      if (!almacen) throw new AppError('Almacén no encontrado.', 404);
      if (!almacen.estado) throw new AppError('El almacén está inactivo.', 400);

      const details = await DetalleSolicitud.findAll({ where: { solicitud_id: solicitud.id }, transaction });
      for (const detail of details) {
        const inventario = await Inventario.findOne({
          where: { almacen_id: input.almacen_asignado_id, medicamento_id: detail.medicamento_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!inventario || inventario.cantidad_disponible < detail.cantidad_solicitada) {
          throw new AppError('El almacén no tiene inventario suficiente para asignar la solicitud.', 400);
        }
      }

      const previousState = solicitud.estado;
      await solicitud.update({
        almacen_asignado_id: input.almacen_asignado_id,
        usuario_asignador_id: usuarioAsignadorId,
        fecha_asignacion: new Date(),
        estado: EstadoSolicitud.ASIGNADA,
      }, { transaction });
      await HistorialSolicitud.create({
        solicitud_id: solicitud.id,
        estado_anterior: previousState,
        estado_nuevo: EstadoSolicitud.ASIGNADA,
        usuario_id: usuarioAsignadorId,
        ...(input.observacion ? { observacion: input.observacion.trim() } : {}),
      }, { transaction });

      return solicitud;
    });
  }
}