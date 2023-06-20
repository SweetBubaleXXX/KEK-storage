import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { backupFile, restoreFile, writeFile, rotateFile } from '../utils/file.utils';
import { storageSpace } from '../utils/storage.utils';
import { FileRequest, BaseResponse, UploadResponse } from '../middleware/file.middleware';
import { config } from '../config';

export function downloadFile(req: FileRequest, res: BaseResponse) {
  const stream = fs.createReadStream(res.locals.filePath);
  stream.on('error', err => {
    console.error(err);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  stream.pipe(res);
};

export async function uploadFile(req: FileRequest, res: UploadResponse) {
  const backupPath = await backupFile(res.locals);
  writeFile(req, res)
    .then(() => {
      res.status(StatusCodes.OK).send(storageSpace);
      if (res.locals.fileExists) {
        setTimeout(() => { rotateFile(backupPath) }, config.BACKUP_FILES_MAX_AGE);
      }
    })
    .catch(err => {
      if (res.locals.fileExists) {
        restoreFile(res.locals.filePath).catch(err => {
          console.error(`Failed to restore file ${req.params.fileId}`);
          console.error(err);
        });
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    });
};

export async function deleteFile(req: FileRequest, res: BaseResponse) {
  const backupPath = await backupFile(res.locals);
  res.status(StatusCodes.OK).send(storageSpace);
  setTimeout(() => { rotateFile(backupPath) }, config.BACKUP_FILES_MAX_AGE);
};
