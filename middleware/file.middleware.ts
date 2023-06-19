import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import { config } from '../config';

interface FileRequestParams { fileId: string };

export type RawFileRequest = Request<FileRequestParams> & {
  fileExists?: boolean,
  filePath?: string,
  fileSize?: number,
};

export type ParsedFileRequest = Required<Omit<RawFileRequest, 'fileSize'>>;

export type UploadFileRequest = Required<RawFileRequest>;

export function checkIfFileExists(req: RawFileRequest, res: Response, next: NextFunction) {
  req.fileExists = fs.existsSync(path.join(config.STORAGE_PATH, req.params.fileId));
  next();
};

export function getFilePath(req: RawFileRequest, res: Response, next: NextFunction) {
  req.filePath = path.join(config.STORAGE_PATH, req.params.fileId);
  next();
};

export function getFileSize(req: RawFileRequest, res: Response, next: NextFunction) {
  if (!req.headers['file-size']) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
  req.fileSize = +req.headers['file-size']!;
  next();
};
