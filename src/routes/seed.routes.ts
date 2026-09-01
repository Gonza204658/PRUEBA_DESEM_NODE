import { Router } from 'express';
import { SeedController } from '../controllers/seed.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadJson } from '../middlewares/upload.middleware';
import { RolUsuario } from '../types/database.types';

export const seedRouter = Router();

seedRouter.post('/json', authenticate, authorize(RolUsuario.ADMINISTRADOR), uploadJson.single('archivo'), SeedController.loadJson);