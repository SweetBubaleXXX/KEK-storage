import express from 'express';

import fileControllers from '../controllers/file.controllers';
import { checkIfFileExists, getFilePath, getFileSize } from '../middleware/file.middleware';

const router = express.Router();

router.use('/:fileId', getFilePath);

router.use('/:fileId', checkIfFileExists);

router.post('/:fileId', getFileSize)

router.get('/:fileId', fileControllers.download);

router.post('/:fileId', fileControllers.upload);

router.delete('/:fileId', fileControllers.remove);

export default router;
