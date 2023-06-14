import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

import config from '../config';

export function checkIfFileExists(req: Request, res: Response, next: NextFunction) {
  req.fileExists = fs.existsSync(path.join(config.STORAGE_PATH, req.params.fileId));
  next();
};

export function getFilePath(req: Request, res: Response, next: NextFunction) {
  req.filePath = path.join(config.STORAGE_PATH, req.params.fileId);
  next();
};

export function getFileSize(req: Request, res: Response, next: NextFunction) {
  req.fileSize = +req.headers['file-size'];
  next();
};
