import express from 'express';

import { downloadFile, uploadFile, deleteFile } from '../controllers/file.controllers';
import {
  checkIfFileExists,
  getFilePath,
  getFileSize,
  validateFileExists,
  validateAvailableSpace,
} from '../middleware/file.middleware';

const router = express.Router();

router.use('/:fileId', getFilePath);

router.use('/:fileId', checkIfFileExists);

router.get('/:fileId', validateFileExists, downloadFile);

router.post('/:fileId', getFileSize, validateAvailableSpace, uploadFile);

router.delete('/:fileId', validateFileExists, deleteFile);

export default router;
