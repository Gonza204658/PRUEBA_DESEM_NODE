# RiwiMediCare

## Información del proyecto

- **Coder:** Diego Fernando Gonzalez Henriquez
- **Clan:** Node + Nest PM Abrahan Villa
- **Repositorio GitHub:** https://github.com/Gonza204658/PRUEBA_DESEM_NODE

RiwiMediCare es una API REST para gestionar solicitudes de abastecimiento de medicamentos realizadas por clínicas y centros de atención. Permite administrar usuarios, clínicas, almacenes, medicamentos, inventarios, solicitudes y el historial de sus estados.

## Tecnologías

- Node.js 18 o superior
- TypeScript
- Express
- PostgreSQL
- Sequelize
- JSON Web Token
- bcryptjs
- Multer
- Swagger JSDoc y Swagger UI

## Requisitos

- Node.js 18 o superior
- npm
- PostgreSQL con la base de datos y las tablas existentes del enunciado

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz a partir de `.env.example`:

```bash
cp .env.example .env
```

Configura las siguientes variables con los datos de tu PostgreSQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=riwimedicare
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRES_IN=1d
```

No subas `.env` al repositorio. Ese archivo contiene credenciales y ya está incluido en `.gitignore`.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Compilar TypeScript:

```bash
npm run build
```

Ejecutar la compilación:

```bash
npm start
```

Verifica que la API esté activa:

```text
GET http://localhost:3000/health
```

## Estructura

```text
src/
├── config/          Configuración de entorno, PostgreSQL y Swagger
├── controllers/     Manejo de solicitudes HTTP y respuestas
├── middlewares/     Autenticación, carga de archivos y errores
├── models/          Modelos Sequelize de las tablas existentes
├── routes/          Definición de endpoints
├── services/        Lógica de negocio y transacciones
├── types/           Tipos, enums y extensiones de Express
└── app.ts           Configuración y arranque de Express
```

## Autenticación y roles

Rutas públicas:

```text
POST /auth/register
POST /auth/login
```

El login retorna un JWT con `id`, `email` y `rol`. Para rutas protegidas envía:

```text
Authorization: Bearer tu_token_jwt
```

Roles disponibles:

- `ADMINISTRADOR`: administra clínicas, almacenes, medicamentos e inventarios.
- `GESTOR_SOLICITUDES`: puede registrar solicitudes, cambiar estados, asignar almacenes y consultar historial completo.

Todos los usuarios autenticados pueden consultar solicitudes activas e historial por clínica.

## Endpoints principales

| Grupo | Endpoint |
| --- | --- |
| Salud | `GET /health` |
| Autenticación | `POST /auth/register`, `POST /auth/login` |
| Clínicas | `POST`, `GET /clinicas`, `GET`, `PATCH`, `DELETE /clinicas/:id` |
| Responsables | `POST /clinicas/:id/responsables` |
| Almacenes | `POST`, `GET /almacenes`, `GET`, `PATCH`, `DELETE /almacenes/:id` |
| Medicamentos | `POST`, `GET /medicamentos`, `GET`, `PATCH`, `DELETE /medicamentos/:id` |
| Inventarios | `POST`, `GET /inventarios`, `GET`, `PATCH /inventarios/:id` |
| Solicitudes | `POST /solicitudes`, `GET /solicitudes/:id` |
| Estados | `PATCH /solicitudes/:id/estado`, `PATCH /solicitudes/:id/asignar` |
| Consultas | `GET /solicitudes/activas`, `GET /solicitudes/clinica/:clinicaId/historial`, `GET /solicitudes/historial-completo` |
| Seeder | `POST /seed/json` |

Consulta ejemplos completos de cada endpoint en `consultas-postman.txt`.

## Estados de solicitud

```text
PENDIENTE -> APROBADA -> ASIGNADA -> DESPACHADA -> COMPLETADA
PENDIENTE -> RECHAZADA
PENDIENTE -> CANCELADA
APROBADA -> CANCELADA
ASIGNADA -> CANCELADA
```

`RECHAZADA`, `COMPLETADA` y `CANCELADA` son estados finales. Cada cambio permitido se registra en `historial_solicitudes` mediante una transacción Sequelize.

## Seeder JSON

El endpoint `POST /seed/json` recibe un archivo JSON en `Body -> form-data`, con el campo de tipo archivo llamado `archivo`.

La carga requiere un usuario `ADMINISTRADOR` y procesa las secciones en este orden:

```text
usuarios
clinicas
almacenes
medicamentos
inventarios
solicitudes
detalles
historial
```

Si un dato es inválido, la transacción se revierte y no se insertan registros parciales. El archivo admite como máximo 2 MB.

## Swagger

La documentación interactiva está disponible mientras la API está ejecutándose:

```text
http://localhost:3000/api-docs
```

Usa el botón **Authorize** e ingresa tu JWT para probar endpoints protegidos desde Swagger UI.

## Gitflow y commits

Ramas recomendadas:

```text
main
develop
feature/auth
feature/clinicas
feature/almacenes
feature/medicamentos
feature/inventario
feature/solicitudes
feature/seed-json
feature/swagger
```

Ejemplos de Conventional Commits:

```text
feat(auth): implementa registro y login con JWT
feat(clinicas): implementa CRUD de clínicas
feat(solicitudes): implementa máquina de estados
docs(swagger): documenta endpoints de la API
fix(inventario): corrige validación de disponibilidad
```
