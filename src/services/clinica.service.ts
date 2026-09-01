import { Clinica, ClinicaResponsable, Usuario } from '../models';
import { AppError } from './appError';

export interface ClinicaInput {
  nombre: string;
  nit: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

export interface ResponsableInput {
  usuario_id: number;
}

function normalizeClinicaInput(input: ClinicaInput): ClinicaInput {
  return {
    nombre: input.nombre.trim(),
    nit: input.nit.trim(),
    direccion: input.direccion.trim(),
    ...(input.telefono ? { telefono: input.telefono.trim() } : {}),
    ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
  };
}

export class ClinicaService {
  static async create(input: ClinicaInput): Promise<Clinica> {
    const clinicData = normalizeClinicaInput(input);
    const existingClinica = await Clinica.findOne({ where: { nit: clinicData.nit } });
    if (existingClinica) {
      throw new AppError('Ya existe una clínica con este NIT.', 409);
    }

    return Clinica.create(clinicData);
  }

  static async findAll(): Promise<Clinica[]> {
    return Clinica.findAll({ order: [['id', 'ASC']] });
  }

  static async findById(id: number): Promise<Clinica> {
    const clinica = await Clinica.findByPk(id, {
      include: [{ model: Usuario, as: 'responsables', attributes: ['id', 'nombre', 'email', 'rol', 'estado'], through: { attributes: ['fecha_asignacion', 'estado'] } }],
    });

    if (!clinica) {
      throw new AppError('Clínica no encontrada.', 404);
    }

    return clinica;
  }

  static async update(id: number, input: Partial<ClinicaInput>): Promise<Clinica> {
    const clinica = await this.findById(id);
    const clinicData = normalizeClinicaInput({
      nombre: input.nombre ?? clinica.nombre,
      nit: input.nit ?? clinica.nit,
      direccion: input.direccion ?? clinica.direccion,
      ...(input.telefono !== undefined ? { telefono: input.telefono } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    });

    if (clinicData.nit !== clinica.nit) {
      const existingClinica = await Clinica.findOne({ where: { nit: clinicData.nit } });
      if (existingClinica) {
        throw new AppError('Ya existe una clínica con este NIT.', 409);
      }
    }

    await clinica.update(clinicData);
    return clinica;
  }

  static async deactivate(id: number): Promise<Clinica> {
    const clinica = await this.findById(id);
    await clinica.update({ estado: false });
    return clinica;
  }

  static async assignResponsable(clinicaId: number, input: ResponsableInput): Promise<ClinicaResponsable> {
    const clinica = await this.findById(clinicaId);
    if (!clinica.estado) {
      throw new AppError('No se pueden asignar responsables a una clínica inactiva.', 400);
    }

    const usuario = await Usuario.findByPk(input.usuario_id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    const existingAssignment = await ClinicaResponsable.findOne({
      where: { clinica_id: clinicaId, usuario_id: input.usuario_id },
    });
    if (existingAssignment) {
      throw new AppError('El usuario ya está asociado a esta clínica.', 409);
    }

    return ClinicaResponsable.create({ clinica_id: clinicaId, usuario_id: input.usuario_id });
  }
}