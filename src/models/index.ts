import { Almacen } from './almacen.model';
import { Clinica } from './clinica.model';
import { ClinicaResponsable } from './clinicaResponsable.model';
import { DetalleSolicitud } from './detalleSolicitud.model';
import { HistorialSolicitud } from './historialSolicitud.model';
import { Inventario } from './inventario.model';
import { Medicamento } from './medicamento.model';
import { Solicitud } from './solicitud.model';
import { Usuario } from './usuario.model';

Usuario.belongsToMany(Clinica, { through: ClinicaResponsable, foreignKey: 'usuario_id', otherKey: 'clinica_id', as: 'clinicas' });
Clinica.belongsToMany(Usuario, { through: ClinicaResponsable, foreignKey: 'clinica_id', otherKey: 'usuario_id', as: 'responsables' });
ClinicaResponsable.belongsTo(Clinica, { foreignKey: 'clinica_id', as: 'clinica' });
ClinicaResponsable.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Almacen.belongsToMany(Medicamento, { through: Inventario, foreignKey: 'almacen_id', otherKey: 'medicamento_id', as: 'medicamentos' });
Medicamento.belongsToMany(Almacen, { through: Inventario, foreignKey: 'medicamento_id', otherKey: 'almacen_id', as: 'almacenes' });
Inventario.belongsTo(Almacen, { foreignKey: 'almacen_id', as: 'almacen' });
Inventario.belongsTo(Medicamento, { foreignKey: 'medicamento_id', as: 'medicamento' });

Clinica.hasMany(Solicitud, { foreignKey: 'clinica_id', as: 'solicitudes' });
Solicitud.belongsTo(Clinica, { foreignKey: 'clinica_id', as: 'clinica' });
Usuario.hasMany(Solicitud, { foreignKey: 'usuario_solicitante_id', as: 'solicitudes_realizadas' });
Solicitud.belongsTo(Usuario, { foreignKey: 'usuario_solicitante_id', as: 'usuario_solicitante' });
Almacen.hasMany(Solicitud, { foreignKey: 'almacen_asignado_id', as: 'solicitudes_asignadas' });
Solicitud.belongsTo(Almacen, { foreignKey: 'almacen_asignado_id', as: 'almacen_asignado' });
Usuario.hasMany(Solicitud, { foreignKey: 'usuario_asignador_id', as: 'solicitudes_asignadas' });
Solicitud.belongsTo(Usuario, { foreignKey: 'usuario_asignador_id', as: 'usuario_asignador' });

Solicitud.hasMany(DetalleSolicitud, { foreignKey: 'solicitud_id', as: 'detalles' });
DetalleSolicitud.belongsTo(Solicitud, { foreignKey: 'solicitud_id', as: 'solicitud' });
Medicamento.hasMany(DetalleSolicitud, { foreignKey: 'medicamento_id', as: 'detalles_solicitud' });
DetalleSolicitud.belongsTo(Medicamento, { foreignKey: 'medicamento_id', as: 'medicamento' });

Solicitud.hasMany(HistorialSolicitud, { foreignKey: 'solicitud_id', as: 'historial' });
HistorialSolicitud.belongsTo(Solicitud, { foreignKey: 'solicitud_id', as: 'solicitud' });
Usuario.hasMany(HistorialSolicitud, { foreignKey: 'usuario_id', as: 'cambios_estado' });
HistorialSolicitud.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

export {
  Almacen,
  Clinica,
  ClinicaResponsable,
  DetalleSolicitud,
  HistorialSolicitud,
  Inventario,
  Medicamento,
  Solicitud,
  Usuario,
};