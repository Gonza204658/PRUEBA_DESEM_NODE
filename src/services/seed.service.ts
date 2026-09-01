import bcrypt from 'bcryptjs';
import type { Model, ModelStatic, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Almacen, Clinica, DetalleSolicitud, HistorialSolicitud, Inventario, Medicamento, Solicitud, Usuario } from '../models';
import { EstadoSolicitud, RolUsuario } from '../types/database.types';
import { AppError } from './appError';

interface SeedUsuario { nombre: string; email: string; password: string; rol: RolUsuario; }
interface SeedClinica { nombre: string; nit: string; direccion: string; telefono?: string | undefined; email?: string | undefined; }
interface SeedAlmacen { nombre: string; direccion: string; }
interface SeedMedicamento { nombre: string; codigo: string; descripcion?: string | undefined; presentacion?: string | undefined; unidad_medida: string; }
interface SeedInventario { almacen_id: number; medicamento_id: number; cantidad_disponible: number; stock_minimo?: number; }
interface SeedSolicitud { clinica_id: number; usuario_solicitante_id: number; almacen_asignado_id?: number; usuario_asignador_id?: number; estado?: EstadoSolicitud; observaciones?: string | undefined; }
interface SeedDetalle { solicitud_id: number; medicamento_id: number; cantidad_solicitada: number; cantidad_aprobada?: number; cantidad_entregada?: number; observaciones?: string | undefined; }
interface SeedHistorial { solicitud_id: number; estado_anterior?: EstadoSolicitud | null; estado_nuevo: EstadoSolicitud; usuario_id: number; observacion?: string | undefined; }

interface SeedData {
  usuarios?: SeedUsuario[];
  clinicas?: SeedClinica[];
  almacenes?: SeedAlmacen[];
  medicamentos?: SeedMedicamento[];
  inventarios?: SeedInventario[];
  solicitudes?: SeedSolicitud[];
  detalles?: SeedDetalle[];
  historial?: SeedHistorial[];
}

const allowedKeys = new Set(['usuarios', 'clinicas', 'almacenes', 'medicamentos', 'inventarios', 'solicitudes', 'detalles', 'historial']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new AppError(`El campo ${field} es obligatorio.`, 400);
  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireText(value, field);
}

function positiveInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) throw new AppError(`${field} debe ser un entero positivo.`, 400);
  return value;
}

function nonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new AppError(`${field} debe ser un entero mayor o igual a cero.`, 400);
  return value;
}

function getArray(data: Record<string, unknown>, key: keyof SeedData): unknown[] {
  const value = data[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new AppError(`${key} debe ser un arreglo.`, 400);
  return value;
}

function parseSeedData(value: unknown): SeedData {
  if (!isRecord(value)) throw new AppError('El JSON debe contener un objeto principal.', 400);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) throw new AppError('El JSON contiene una sección no permitida.', 400);

  const usuarios = getArray(value, 'usuarios').map((item): SeedUsuario => {
    if (!isRecord(item)) throw new AppError('Los usuarios son inválidos.', 400);
    const rol = item.rol;
    if (!Object.values(RolUsuario).includes(rol as RolUsuario)) throw new AppError('El rol de un usuario es inválido.', 400);
    return { nombre: requireText(item.nombre, 'usuarios.nombre'), email: requireText(item.email, 'usuarios.email').toLowerCase(), password: requireText(item.password, 'usuarios.password'), rol: rol as RolUsuario };
  });
  const clinicas = getArray(value, 'clinicas').map((item): SeedClinica => {
    if (!isRecord(item)) throw new AppError('Las clínicas son inválidas.', 400);
    return { nombre: requireText(item.nombre, 'clinicas.nombre'), nit: requireText(item.nit, 'clinicas.nit'), direccion: requireText(item.direccion, 'clinicas.direccion'), ...(optionalText(item.telefono, 'clinicas.telefono') ? { telefono: optionalText(item.telefono, 'clinicas.telefono') } : {}), ...(optionalText(item.email, 'clinicas.email') ? { email: optionalText(item.email, 'clinicas.email')!.toLowerCase() } : {}) };
  });
  const almacenes = getArray(value, 'almacenes').map((item): SeedAlmacen => {
    if (!isRecord(item)) throw new AppError('Los almacenes son inválidos.', 400);
    return { nombre: requireText(item.nombre, 'almacenes.nombre'), direccion: requireText(item.direccion, 'almacenes.direccion') };
  });
  const medicamentos = getArray(value, 'medicamentos').map((item): SeedMedicamento => {
    if (!isRecord(item)) throw new AppError('Los medicamentos son inválidos.', 400);
    return { nombre: requireText(item.nombre, 'medicamentos.nombre'), codigo: requireText(item.codigo, 'medicamentos.codigo').toUpperCase(), unidad_medida: requireText(item.unidad_medida, 'medicamentos.unidad_medida'), ...(optionalText(item.descripcion, 'medicamentos.descripcion') ? { descripcion: optionalText(item.descripcion, 'medicamentos.descripcion') } : {}), ...(optionalText(item.presentacion, 'medicamentos.presentacion') ? { presentacion: optionalText(item.presentacion, 'medicamentos.presentacion') } : {}) };
  });
  const inventarios = getArray(value, 'inventarios').map((item): SeedInventario => {
    if (!isRecord(item)) throw new AppError('Los inventarios son inválidos.', 400);
    return { almacen_id: positiveInteger(item.almacen_id, 'inventarios.almacen_id'), medicamento_id: positiveInteger(item.medicamento_id, 'inventarios.medicamento_id'), cantidad_disponible: nonNegativeInteger(item.cantidad_disponible, 'inventarios.cantidad_disponible'), ...(item.stock_minimo !== undefined ? { stock_minimo: nonNegativeInteger(item.stock_minimo, 'inventarios.stock_minimo') } : {}) };
  });
  const solicitudes = getArray(value, 'solicitudes').map((item): SeedSolicitud => {
    if (!isRecord(item)) throw new AppError('Las solicitudes son inválidas.', 400);
    const estado = item.estado;
    if (estado !== undefined && !Object.values(EstadoSolicitud).includes(estado as EstadoSolicitud)) throw new AppError('El estado de una solicitud es inválido.', 400);
    return { clinica_id: positiveInteger(item.clinica_id, 'solicitudes.clinica_id'), usuario_solicitante_id: positiveInteger(item.usuario_solicitante_id, 'solicitudes.usuario_solicitante_id'), ...(item.almacen_asignado_id !== undefined ? { almacen_asignado_id: positiveInteger(item.almacen_asignado_id, 'solicitudes.almacen_asignado_id') } : {}), ...(item.usuario_asignador_id !== undefined ? { usuario_asignador_id: positiveInteger(item.usuario_asignador_id, 'solicitudes.usuario_asignador_id') } : {}), ...(estado !== undefined ? { estado: estado as EstadoSolicitud } : {}), ...(optionalText(item.observaciones, 'solicitudes.observaciones') ? { observaciones: optionalText(item.observaciones, 'solicitudes.observaciones') } : {}) };
  });
  const detalles = getArray(value, 'detalles').map((item): SeedDetalle => {
    if (!isRecord(item)) throw new AppError('Los detalles son inválidos.', 400);
    return { solicitud_id: positiveInteger(item.solicitud_id, 'detalles.solicitud_id'), medicamento_id: positiveInteger(item.medicamento_id, 'detalles.medicamento_id'), cantidad_solicitada: positiveInteger(item.cantidad_solicitada, 'detalles.cantidad_solicitada'), ...(item.cantidad_aprobada !== undefined ? { cantidad_aprobada: nonNegativeInteger(item.cantidad_aprobada, 'detalles.cantidad_aprobada') } : {}), ...(item.cantidad_entregada !== undefined ? { cantidad_entregada: nonNegativeInteger(item.cantidad_entregada, 'detalles.cantidad_entregada') } : {}), ...(optionalText(item.observaciones, 'detalles.observaciones') ? { observaciones: optionalText(item.observaciones, 'detalles.observaciones') } : {}) };
  });
  const historial = getArray(value, 'historial').map((item): SeedHistorial => {
    if (!isRecord(item)) throw new AppError('El historial es inválido.', 400);
    const previousState = item.estado_anterior;
    const nextState = item.estado_nuevo;
    if ((previousState !== undefined && previousState !== null && !Object.values(EstadoSolicitud).includes(previousState as EstadoSolicitud)) || !Object.values(EstadoSolicitud).includes(nextState as EstadoSolicitud)) throw new AppError('El estado del historial es inválido.', 400);
    return { solicitud_id: positiveInteger(item.solicitud_id, 'historial.solicitud_id'), ...(previousState !== undefined ? { estado_anterior: previousState as EstadoSolicitud | null } : {}), estado_nuevo: nextState as EstadoSolicitud, usuario_id: positiveInteger(item.usuario_id, 'historial.usuario_id'), ...(optionalText(item.observacion, 'historial.observacion') ? { observacion: optionalText(item.observacion, 'historial.observacion') } : {}) };
  });
  return { usuarios, clinicas, almacenes, medicamentos, inventarios, solicitudes, detalles, historial };
}

async function mustExist(model: ModelStatic<Model>, id: number, label: string, transaction: Transaction): Promise<void> {
  if (!await model.findByPk(id, { transaction })) throw new AppError(`${label} con id ${id} no existe.`, 400);
}

export class SeedService {
  static async load(fileBuffer: Buffer): Promise<Record<string, number>> {
    let rawData: unknown;
    try { rawData = JSON.parse(fileBuffer.toString('utf8')); }
    catch { throw new AppError('El archivo no contiene JSON válido.', 400); }
    const data = parseSeedData(rawData);

    return sequelize.transaction(async (transaction) => {
      for (const user of data.usuarios ?? []) {
        if (await Usuario.findOne({ where: { email: user.email }, transaction })) throw new AppError(`El usuario ${user.email} ya existe.`, 409);
        await Usuario.create({ ...user, password_hash: await bcrypt.hash(user.password, 10) }, { transaction });
      }
      for (const clinica of data.clinicas ?? []) {
        if (await Clinica.findOne({ where: { nit: clinica.nit }, transaction })) throw new AppError(`La clínica con NIT ${clinica.nit} ya existe.`, 409);
        await Clinica.create({ ...clinica, telefono: clinica.telefono ?? null, email: clinica.email ?? null }, { transaction });
      }
      for (const almacen of data.almacenes ?? []) await Almacen.create(almacen, { transaction });
      for (const medicamento of data.medicamentos ?? []) {
        if (await Medicamento.findOne({ where: { codigo: medicamento.codigo }, transaction })) throw new AppError(`El medicamento ${medicamento.codigo} ya existe.`, 409);
        await Medicamento.create({ ...medicamento, descripcion: medicamento.descripcion ?? null, presentacion: medicamento.presentacion ?? null }, { transaction });
      }
      for (const inventario of data.inventarios ?? []) {
        await mustExist(Almacen, inventario.almacen_id, 'Almacén', transaction);
        await mustExist(Medicamento, inventario.medicamento_id, 'Medicamento', transaction);
        if (await Inventario.findOne({ where: { almacen_id: inventario.almacen_id, medicamento_id: inventario.medicamento_id }, transaction })) throw new AppError('El inventario ya existe para ese almacén y medicamento.', 409);
        await Inventario.create(inventario, { transaction });
      }
      for (const solicitud of data.solicitudes ?? []) {
        await mustExist(Clinica, solicitud.clinica_id, 'Clínica', transaction);
        await mustExist(Usuario, solicitud.usuario_solicitante_id, 'Usuario solicitante', transaction);
        if (solicitud.almacen_asignado_id) await mustExist(Almacen, solicitud.almacen_asignado_id, 'Almacén', transaction);
        if (solicitud.usuario_asignador_id) await mustExist(Usuario, solicitud.usuario_asignador_id, 'Usuario asignador', transaction);
        await Solicitud.create({
          ...solicitud,
          almacen_asignado_id: solicitud.almacen_asignado_id ?? null,
          usuario_asignador_id: solicitud.usuario_asignador_id ?? null,
          fecha_asignacion: solicitud.usuario_asignador_id ? new Date() : null,
          observaciones: solicitud.observaciones ?? null,
        }, { transaction });
      }
      for (const detalle of data.detalles ?? []) {
        await mustExist(Solicitud, detalle.solicitud_id, 'Solicitud', transaction);
        await mustExist(Medicamento, detalle.medicamento_id, 'Medicamento', transaction);
        if (await DetalleSolicitud.findOne({ where: { solicitud_id: detalle.solicitud_id, medicamento_id: detalle.medicamento_id }, transaction })) throw new AppError('El detalle ya existe para esa solicitud y medicamento.', 409);
        await DetalleSolicitud.create({
          ...detalle,
          cantidad_aprobada: detalle.cantidad_aprobada ?? null,
          cantidad_entregada: detalle.cantidad_entregada ?? null,
          observaciones: detalle.observaciones ?? null,
        }, { transaction });
      }
      for (const entry of data.historial ?? []) {
        await mustExist(Solicitud, entry.solicitud_id, 'Solicitud', transaction);
        await mustExist(Usuario, entry.usuario_id, 'Usuario', transaction);
        await HistorialSolicitud.create({
          ...entry,
          estado_anterior: entry.estado_anterior ?? null,
          observacion: entry.observacion ?? null,
        }, { transaction });
      }
      return Object.fromEntries(Object.entries(data).map(([key, items]) => [key, items?.length ?? 0]));
    });
  }
}