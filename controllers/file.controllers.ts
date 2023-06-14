import fs from 'fs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { moveFile, writeFile } from '../utils/file.utils';
import { storageSpace } from '../utils/storage.utils';
import { FileRequestParams, UploadFileRequestParams } from '../middleware/file.middleware';

export function download(req: Request<FileRequestParams>, res: Response) {
  if (!req.params.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const stream = fs.createReadStream(req.params.filePath);
  stream.on('error', err => {
    console.error(err);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  stream.pipe(res);
};

export async function upload(req: Request<UploadFileRequestParams>, res: Response) {
  const fileIsTooBig = storageSpace.used + req.params.fileSize > storageSpace.capacity;
  if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

  const backupFilePath = `${req.params.filePath}.old`;
  let existingFileSize = 0;
  if (req.params.fileExists) {
    existingFileSize = fs.statSync(req.params.filePath).size;
    await moveFile(req.params.filePath, backupFilePath);
  }
  writeFile(req)
    .then(() => {
      storageSpace.used += (req.params.fileSize - existingFileSize);
      res.status(StatusCodes.OK).send(storageSpace);
    })
    .catch(err => {
      if (req.params.fileExists) moveFile(backupFilePath, req.params.filePath);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    });
};

export function remove(req: Request<FileRequestParams>, res: Response) {
  if (!req.params.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const fileSize = fs.statSync(req.params.filePath).size;
  fs.unlink(req.params.filePath, err => {
    if (err) {
      console.error(err);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    storageSpace.used -= fileSize;
    res.status(StatusCodes.OK).send(storageSpace);
  })
};

export default {
  download,
  upload,
  remove,
};
