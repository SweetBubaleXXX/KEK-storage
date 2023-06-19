import fs from 'fs';
import path from 'path';
import { Request } from 'express';

import { config } from '../config';
import { UploadFileRequest } from '../middleware/file.middleware';

export function moveFile(oldPath: string, newPath: string) {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function removeOldFilesPromise(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    removeOldFiles(err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function removeOldFiles(callback: (err: any) => void) {
  fs.readdir(config.STORAGE_PATH, (err, files) => {
    if (err) return callback && callback(err);
    files.forEach(filename => {
      if (filename.endsWith('.old')) {
        fs.unlink(
          path.join(config.STORAGE_PATH, filename),
          err => { if (err) callback && callback(err) }
        );
      }
    });
  });
}

export function writeFile(req: UploadFileRequest): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(req.filePath);
    stream.on('open', () => {
      req.pipe(stream);
    });
    stream.on('error', err => {
      console.error(err);
      reject('Error occured while writing file');
    });
    stream.on('close', () => {
      if (stream.bytesWritten !== req.fileSize) {
        return reject(
          'File wasn\'t written properly. ' +
          `Expected size ${req.headers['file-size']}, ` +
          `actual size ${stream.bytesWritten} bytes.`
        );
      }
      fs.chmod(
        req.filePath,
        config.FILE_MODE,
        err => { if (err) console.error(err) }
      );
      resolve();
    });
  });
}
