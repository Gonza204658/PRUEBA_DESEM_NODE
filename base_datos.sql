-- ENUM TYPES
CREATE TYPE rol_usuario AS ENUM ('ADMINISTRADOR', 'GESTOR_SOLICITUDES');
 
CREATE TYPE estado_solicitud AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'ASIGNADA',
    'DESPACHADA',
    'COMPLETADA',
    'CANCELADA'
);
 
-- -------------------------------------------------------------
-- TABLA: usuarios
-- -------------------------------------------------------------
CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    rol             rol_usuario     NOT NULL DEFAULT 'GESTOR_SOLICITUDES',
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuarios_email UNIQUE (email)
);
 
CREATE INDEX idx_usuarios_email ON usuarios (email);
CREATE INDEX idx_usuarios_rol   ON usuarios (rol);
 
-- -------------------------------------------------------------
-- TABLA: clinicas
-- -------------------------------------------------------------
CREATE TABLE clinicas (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    nit             VARCHAR(30)     NOT NULL,
    direccion       VARCHAR(255)    NOT NULL,
    telefono        VARCHAR(30),
    email           VARCHAR(150),
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_clinicas_nit UNIQUE (nit)
);
 
CREATE INDEX idx_clinicas_nit ON clinicas (nit);
 
-- -------------------------------------------------------------
-- TABLA: clinica_responsables (N:M usuarios <-> clinicas)
-- -------------------------------------------------------------
CREATE TABLE clinica_responsables (
    id                BIGSERIAL PRIMARY KEY,
    clinica_id        BIGINT      NOT NULL REFERENCES clinicas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    usuario_id        BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_asignacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado            BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_clinica_usuario UNIQUE (clinica_id, usuario_id)
);
 
CREATE INDEX idx_clinica_responsables_clinica ON clinica_responsables (clinica_id);
CREATE INDEX idx_clinica_responsables_usuario ON clinica_responsables (usuario_id);
 
-- -------------------------------------------------------------
-- TABLA: almacenes
-- -------------------------------------------------------------
CREATE TABLE almacenes (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    direccion       VARCHAR(255)    NOT NULL,
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
 
-- -------------------------------------------------------------
-- TABLA: medicamentos
-- -------------------------------------------------------------
CREATE TABLE medicamentos (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    codigo          VARCHAR(30)     NOT NULL,
    descripcion     TEXT,
    presentacion    VARCHAR(100),
    unidad_medida   VARCHAR(30)     NOT NULL,
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_medicamentos_codigo UNIQUE (codigo)
);
 
CREATE INDEX idx_medicamentos_codigo ON medicamentos (codigo);
 
-- -------------------------------------------------------------
-- TABLA: inventarios (Almacen <-> Medicamento)
-- -------------------------------------------------------------
CREATE TABLE inventarios (
    id                  BIGSERIAL PRIMARY KEY,
    almacen_id          BIGINT   NOT NULL REFERENCES almacenes(id)    ON DELETE RESTRICT ON UPDATE CASCADE,
    medicamento_id      BIGINT   NOT NULL REFERENCES medicamentos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad_disponible INTEGER  NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
    stock_minimo        INTEGER  DEFAULT 0 CHECK (stock_minimo >= 0),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_almacen_medicamento UNIQUE (almacen_id, medicamento_id)
);
 
CREATE INDEX idx_inventarios_almacen     ON inventarios (almacen_id);
CREATE INDEX idx_inventarios_medicamento ON inventarios (medicamento_id);
 
-- -------------------------------------------------------------
-- TABLA: solicitudes
-- -------------------------------------------------------------
CREATE TABLE solicitudes (
    id                      BIGSERIAL PRIMARY KEY,
    clinica_id              BIGINT   NOT NULL REFERENCES clinicas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    usuario_solicitante_id  BIGINT   NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    almacen_asignado_id     BIGINT   REFERENCES almacenes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    usuario_asignador_id    BIGINT   REFERENCES usuarios(id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    estado                  estado_solicitud NOT NULL DEFAULT 'PENDIENTE',
    fecha_asignacion        TIMESTAMPTZ,
    observaciones           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE INDEX idx_solicitudes_clinica    ON solicitudes (clinica_id);
CREATE INDEX idx_solicitudes_estado     ON solicitudes (estado);
CREATE INDEX idx_solicitudes_created_at ON solicitudes (created_at);
CREATE INDEX idx_solicitudes_almacen    ON solicitudes (almacen_asignado_id);
 
-- -------------------------------------------------------------
-- TABLA: detalle_solicitudes
-- -------------------------------------------------------------
CREATE TABLE detalle_solicitudes (
    id                    BIGSERIAL PRIMARY KEY,
    solicitud_id          BIGINT  NOT NULL REFERENCES solicitudes(id)  ON DELETE CASCADE  ON UPDATE CASCADE,
    medicamento_id        BIGINT  NOT NULL REFERENCES medicamentos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad_solicitada   INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_aprobada     INTEGER CHECK (cantidad_aprobada >= 0),
    cantidad_entregada    INTEGER CHECK (cantidad_entregada >= 0),
    observaciones         TEXT,
    CONSTRAINT uq_solicitud_medicamento UNIQUE (solicitud_id, medicamento_id)
);
 
CREATE INDEX idx_detalle_solicitud    ON detalle_solicitudes (solicitud_id);
CREATE INDEX idx_detalle_medicamento  ON detalle_solicitudes (medicamento_id);
 
-- -------------------------------------------------------------
-- TABLA: historial_solicitudes
-- -------------------------------------------------------------
CREATE TABLE historial_solicitudes (
    id                BIGSERIAL PRIMARY KEY,
    solicitud_id      BIGINT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    estado_anterior   estado_solicitud,
    estado_nuevo      estado_solicitud NOT NULL,
    usuario_id        BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_cambio      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observacion       TEXT
);
 
CREATE INDEX idx_historial_solicitud ON historial_solicitudes (solicitud_id);
CREATE INDEX idx_historial_fecha     ON historial_solicitudes (fecha_cambio);
 
