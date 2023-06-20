import fs from 'fs';
import path from 'path';

import { config } from '../config';
import { FileRequest, UploadResponse } from '../middleware/file.middleware';
import { storageSpace } from './storage.utils';
import { FileInfo } from '../middleware/file.middleware';

export function rotateBackupsPromise(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rotateBackups(err => {
      if (err) reject(err);
      resolve();
    });
  });
};

export function rotateBackups(callback: (err: any) => void = console.error) {
  fs.readdir(config.STORAGE_PATH, (err, files) => {
    if (err) return callback(err);
    files.forEach(filename => {
      rotateFile(path.join(config.STORAGE_PATH, filename), callback);
    });
  });
};

export function rotateFile(filePath: string, callback: (err: any) => void = console.error) {
  if (filePath.endsWith('.bak') && fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (backupIsOld(stats)) {
      fs.unlink(
        filePath,
        err => {
          if (err) return callback(err);
          storageSpace.reservedForBackups -= stats.size;
          console.log(`Backup file ${path.basename(filePath)} (${stats.size} bytes) deleted`);
        }
      );
    }
  }

  function backupIsOld(fileStats: fs.Stats) {
    return (Date.now() - fileStats.mtimeMs) > config.BACKUP_FILES_MAX_AGE;
  }
};

export async function backupFile(metadata: FileInfo): Promise<string> {
  const backupPath = `${metadata.filePath}.bak`;
  if (metadata.fileExists) {
    const fileSize = fs.statSync(metadata.filePath).size;
    const existingBackupSize = fs.existsSync(backupPath) ? fs.statSync(backupPath).size : 0;
    await moveFile(metadata.filePath, backupPath);
    storageSpace.reservedForBackups += (fileSize - existingBackupSize);
    storageSpace.used -= fileSize;
  }
  return backupPath;
};

export async function restoreFile(filePath: string): Promise<void> {
  const backupFilePath = `${filePath}.bak`;
  if (!fs.existsSync(backupFilePath)) throw new Error('Backup file doesn\'t exist');
  const backupSize = fs.statSync(backupFilePath).size;
  const existingFileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
  await moveFile(backupFilePath, filePath);
  storageSpace.reservedForBackups -= backupSize;
  storageSpace.used += (backupSize - existingFileSize);
};

export function moveFile(oldPath: string, newPath: string) {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, err => {
      if (err) reject(err);
      resolve();
    });
  });
};

export function writeFile(req: FileRequest, res: UploadResponse): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const stream = fs.createWriteStream(res.locals.filePath);
    stream.on('open', () => {
      req.pipe(stream);
    });
    stream.on('error', err => {
      console.error(err);
      reject('Error occured while writing file');
    });
    stream.on('close', () => {
      storageSpace.used += stream.bytesWritten;
      if (stream.bytesWritten !== res.locals.fileSize) {
        return reject(
          'File wasn\'t written properly. ' +
          `Expected size ${res.locals.fileSize}, ` +
          `actual size ${stream.bytesWritten} bytes.`
        );
      }
      fs.chmod(
        res.locals.filePath,
        config.FILE_MODE,
        err => { if (err) console.error(err) }
      );
      resolve(stream.bytesWritten);
    });
  });
};
