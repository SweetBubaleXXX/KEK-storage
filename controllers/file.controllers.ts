import fs from 'fs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { moveFile, writeFile } from '../utils/file.utils';
import { storageSpace } from '../utils/storage.utils';
import { ParsedFileRequest, UploadFileRequest } from '../middleware/file.middleware';

export function downloadFile(req: ParsedFileRequest, res: Response) {
  if (!req.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const stream = fs.createReadStream(req.filePath);
  stream.on('error', err => {
    console.error(err);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  stream.pipe(res);
};

export async function uploadFile(req: UploadFileRequest, res: Response) {
  const fileIsTooBig = storageSpace.used + req.fileSize > storageSpace.capacity;
  if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

  const backupFilePath = `${req.filePath}.old`;
  let existingFileSize = 0;
  if (req.fileExists) {
    existingFileSize = fs.statSync(req.filePath).size;
    await moveFile(req.filePath, backupFilePath);
  }
  writeFile(req)
    .then(() => {
      storageSpace.used += (req.fileSize - existingFileSize);
      res.status(StatusCodes.OK).send(storageSpace);
    })
    .catch(err => {
      if (req.fileExists) moveFile(backupFilePath, req.filePath);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    });
};

export function deleteFile(req: ParsedFileRequest, res: Response) {
  if (!req.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
  const fileSize = fs.statSync(req.filePath).size;
  fs.unlink(req.filePath, err => {
    if (err) {
      console.error(err);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    storageSpace.used -= fileSize;
    res.status(StatusCodes.OK).send(storageSpace);
  })
};
