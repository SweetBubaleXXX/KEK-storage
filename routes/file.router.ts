import express from 'express';

import { downloadFile, uploadFile, deleteFile } from '../controllers/file.controllers';
import { checkIfFileExists, getFilePath, getFileSize } from '../middleware/file.middleware';

const router = express.Router();

router.use('/:fileId', getFilePath);

router.use('/:fileId', checkIfFileExists);

router.get('/:fileId', downloadFile);

router.post('/:fileId', getFileSize, uploadFile);

router.delete('/:fileId', deleteFile);

export default router;
