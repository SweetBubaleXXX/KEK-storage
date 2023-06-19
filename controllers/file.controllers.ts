import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { moveFile, writeFile, rotateFile } from '../utils/file.utils';
import { storageSpace } from '../utils/storage.utils';
import { FileRequest, BaseResponse, UploadResponse } from '../middleware/file.middleware';
import { config } from '../config';

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
  const fileIsTooLarge = storageSpace.used + res.locals.fileSize > storageSpace.capacity;
  if (fileIsTooLarge) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

  const backupFilePath = `${res.locals.filePath}.bak`;
  let existingFileSize = 0;
  if (res.locals.fileExists) {
    existingFileSize = fs.statSync(res.locals.filePath).size;
    await moveFile(res.locals.filePath, backupFilePath);
  }
  writeFile(req, res)
    .then(() => {
      storageSpace.used += (res.locals.fileSize - existingFileSize);
      res.status(StatusCodes.OK).send(storageSpace);
      if (res.locals.fileExists) {
        setTimeout(() => { rotateFile(backupFilePath) }, config.BACKUP_FILES_MAX_AGE);
      }
    })
    .catch(err => {
      if (res.locals.fileExists) moveFile(backupFilePath, res.locals.filePath);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    });
};

export async function deleteFile(req: FileRequest, res: BaseResponse) {
  if (!res.locals.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const fileSize = fs.statSync(res.locals.filePath).size;
  const backupFilePath = `${res.locals.filePath}.bak`;
  await moveFile(res.locals.filePath, backupFilePath);
  storageSpace.used -= fileSize;
  storageSpace.reservedForBackups += fileSize;
  res.status(StatusCodes.OK).send(storageSpace);
  setTimeout(() => { rotateFile(backupFilePath) }, config.BACKUP_FILES_MAX_AGE);
};
