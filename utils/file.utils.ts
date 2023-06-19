import fs from 'fs';
import path from 'path';

import { config } from '../config';
import { FileRequest, UploadResponse } from '../middleware/file.middleware';
import { storageSpace } from './storage.utils';

export function moveFile(oldPath: string, newPath: string) {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function rotateBackupsPromise(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rotateBackups(err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function rotateBackups(callback: (err: any) => void = console.error) {
  fs.readdir(config.STORAGE_PATH, (err, files) => {
    if (err) return callback(err);
    files.forEach(filename => {
      rotateFile(path.join(config.STORAGE_PATH, filename), callback);
    });
  });
}

export function rotateFile(filePath: string, callback: (err: any) => void = console.error) {
  if (filePath.endsWith('.bak') && fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (fileIsOld(stats)) {
      fs.unlink(
        filePath,
        err => {
          if (err) return callback(err);
          console.log(`Backup file ${path.basename(filePath)} (${stats.size} bytes) deleted`);
          storageSpace.reservedForBackups -= stats.size;
        }
      );
    }
  }

  function fileIsOld(fileStats: fs.Stats) {
    return (Date.now() - fileStats.mtimeMs) / 1000 > config.BACKUP_FILES_MAX_AGE;
  }
}

export function writeFile(req: FileRequest, res: UploadResponse): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(res.locals.filePath);
    stream.on('open', () => {
      req.pipe(stream);
    });
    stream.on('error', err => {
      console.error(err);
      reject('Error occured while writing file');
    });
    stream.on('close', () => {
      if (stream.bytesWritten !== res.locals.fileSize) {
        return reject(
          'File wasn\'t written properly. ' +
          `Expected size ${req.headers['file-size']}, ` +
          `actual size ${stream.bytesWritten} bytes.`
        );
      }
      fs.chmod(
        res.locals.filePath,
        config.FILE_MODE,
        err => { if (err) console.error(err) }
      );
      resolve();
    });
  });
}
