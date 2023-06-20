import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import { config } from '../config';
import { storageSpace } from '../utils/storage.utils';
import { rotateBackups } from '../utils/file.utils';

interface FileRequestParams { fileId: string };

export type FileRequest = Request<FileRequestParams>;

interface Locals {
  fileExists?: boolean,
  filePath?: string,
  fileSize?: number,
};

export type FileInfo = Required<Omit<Locals, 'fileSize'>> & Pick<Locals, 'fileSize'>;

export type UploadFileInfo = Required<Locals>;

type RawResponse = Response<any, Locals>;

export type BaseResponse = Response<any, FileInfo>;

export type UploadResponse = Response<any, UploadFileInfo>;

export function validateFileExists(req: FileRequest, res: RawResponse, next: NextFunction) {
  if (!checkIfFileExists(req, res)) return res.sendStatus(StatusCodes.NOT_FOUND);
  next();
};

export function checkIfFileExists(req: FileRequest, res: RawResponse, next?: NextFunction): boolean {
  res.locals.fileExists = res.locals.fileExists ?? fs.existsSync(getFilePath(req, res));
  next && next();
  return res.locals.fileExists;
};

export function getFilePath(req: FileRequest, res: RawResponse, next?: NextFunction): string {
  res.locals.filePath = res.locals.filePath ?? path.join(config.STORAGE_PATH, req.params.fileId);
  next && next();
  return res.locals.filePath;
};

export function validateAvailableSpace(req: FileRequest, res: RawResponse, next: NextFunction) {
  const fileSize = getFileSize(req, res);
  if (typeof fileSize === 'number') {
    const fileIsTooLarge = storageSpace.used + fileSize > storageSpace.capacity;
    if (fileIsTooLarge) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);
    const freeSpace = storageSpace.capacity - (storageSpace.used + storageSpace.reservedForBackups);
    if (freeSpace < fileSize) rotateBackups();
  }
  next();
};

export function getFileSize(req: FileRequest, res: RawResponse, next?: NextFunction): number | RawResponse {
  if (!req.headers['file-size']) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
  res.locals.fileSize = res.locals.fileSize ?? +req.headers['file-size'];
  next && next();
  return res.locals.fileSize;
};
