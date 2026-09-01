import multer from 'multer';
import { AppError } from '../services/appError';

export const uploadJson = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== 'application/json' && !file.originalname.toLowerCase().endsWith('.json')) {
      callback(new AppError('El archivo debe tener formato JSON.', 400));
      return;
    }

    callback(null, true);
  },
});