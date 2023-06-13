import express from 'express';

import { storageInfo } from '../controllers/info.controllers';

const router = express.Router();

router.get('/space', storageInfo);

export default router;
