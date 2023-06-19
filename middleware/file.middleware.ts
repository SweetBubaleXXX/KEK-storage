import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import { config } from '../config';

interface FileRequestParams { fileId: string };

export type FileRequest = Request<FileRequestParams>;

interface Locals {
  fileExists?: boolean,
  filePath?: string,
  fileSize?: number,
};

type RawResponse = Response<any, Locals>;

export type BaseResponse = Response<any, Required<Omit<Locals, 'fileSize'>>>;

export type UploadResponse = Response<any, Required<Locals>>;

export function checkIfFileExists(req: FileRequest, res: RawResponse, next: NextFunction) {
  res.locals.fileExists = fs.existsSync(path.join(config.STORAGE_PATH, req.params.fileId));
  next();
};

export function getFilePath(req: FileRequest, res: RawResponse, next: NextFunction) {
  res.locals.filePath = path.join(config.STORAGE_PATH, req.params.fileId);
  next();
};

export function getFileSize(req: FileRequest, res: RawResponse, next: NextFunction) {
  if (!req.headers['file-size']) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
  res.locals.fileSize = +req.headers['file-size']!;
  next();
};
