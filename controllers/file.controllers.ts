import fs from 'fs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { moveFile, writeFile } from '../utils/file.utils';
import { storageSpace } from '../utils/storage.utils';
import { FileRequest, BaseResponse, UploadResponse } from '../middleware/file.middleware';

export function downloadFile(req: FileRequest, res: BaseResponse) {
  if (!res.locals.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const stream = fs.createReadStream(res.locals.filePath);
  stream.on('error', err => {
    console.error(err);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  stream.pipe(res);
};

export async function uploadFile(req: FileRequest, res: UploadResponse) {
  const fileIsTooBig = storageSpace.used + res.locals.fileSize > storageSpace.capacity;
  if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

  const backupFilePath = `${res.locals.filePath}.old`;
  let existingFileSize = 0;
  if (res.locals.fileExists) {
    existingFileSize = fs.statSync(res.locals.filePath).size;
    await moveFile(res.locals.filePath, backupFilePath);
  }
  writeFile(req, res)
    .then(() => {
      storageSpace.used += (res.locals.fileSize - existingFileSize);
      res.status(StatusCodes.OK).send(storageSpace);
    })
    .catch(err => {
      if (res.locals.fileExists) moveFile(backupFilePath, res.locals.filePath);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    });
};

export function deleteFile(req: FileRequest, res: BaseResponse) {
  if (!res.locals.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const fileSize = fs.statSync(res.locals.filePath).size;
  fs.unlink(res.locals.filePath, err => {
    if (err) {
      console.error(err);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    storageSpace.used -= fileSize;
    res.status(StatusCodes.OK).send(storageSpace);
  })
};
