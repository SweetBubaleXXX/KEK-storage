import fs from 'fs';
import path from 'path';

import config from '../config';

export function moveFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function removeOldFilesPromise(): Promise<void> {
  return new Promise((resolve, reject) => {
    removeOldFiles(err => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function removeOldFiles(callback) {
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

export function writeFile(req) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(req.filePath);
    stream.on('open', () => {
      req.pipe(stream);
    });
    stream.on('error', err => {
      console.error(err);
      reject('Error occured while writing file');
    });
    stream.on('close', () => {
      if (stream.bytesWritten !== +req.headers['file-size']) {
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
