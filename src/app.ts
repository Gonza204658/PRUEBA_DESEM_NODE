import express, { type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { sequelize } from './config/database';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import './models';
import { almacenRouter } from './routes/almacen.routes';
import { authRouter } from './routes/auth.routes';
import { clinicaRouter } from './routes/clinica.routes';
import { inventarioRouter } from './routes/inventario.routes';
import { medicamentoRouter } from './routes/medicamento.routes';
import { seedRouter } from './routes/seed.routes';
import { solicitudRouter } from './routes/solicitud.routes';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRouter);
app.use('/clinicas', clinicaRouter);
app.use('/almacenes', almacenRouter);
app.use('/medicamentos', medicamentoRouter);
app.use('/inventarios', inventarioRouter);
app.use('/solicitudes', solicitudRouter);
app.use('/seed', seedRouter);

app.get('/health', (_request: Request, response: Response) => {
	response.status(200).json({
		success: true,
		message: 'RiwiMediCare API funcionando correctamente',
		data: null,
	});
});

app.use((_request, _response, next) => {
	next(new Error('Ruta no encontrada.'));
});

app.use(errorHandler);

async function startServer(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log('Conexión a PostgreSQL establecida correctamente.');

		app.listen(env.port, () => {
			console.log(`Servidor ejecutándose en el puerto ${env.port}`);
		});
	} catch (error: unknown) {
		console.error('No fue posible conectar con PostgreSQL.', error);
		process.exit(1);
	}
}

void startServer();
