import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import config from '../config';

interface RawFileRequestParams {
  fileId: string,
  fileSize?: number,
  fileExists?: boolean,
  filePath?: string,
};

export type FileRequestParams = Required<Omit<RawFileRequestParams, 'fileSize'>>;

export type UploadFileRequestParams = Required<RawFileRequestParams>;

export function checkIfFileExists(req: Request<RawFileRequestParams>, _res: Response, next: NextFunction) {
  req.params.fileExists = fs.existsSync(path.join(config.STORAGE_PATH, req.params.fileId));
  next();
};

export function getFilePath(req: Request<RawFileRequestParams>, _res: Response, next: NextFunction) {
  req.params.filePath = path.join(config.STORAGE_PATH, req.params.fileId);
  next();
};

export function getFileSize(req: Request<RawFileRequestParams>, res: Response, next: NextFunction) {
  if (!req.headers['file-size']) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
  req.params.fileSize = +req.headers['file-size']!;
  next();
};
