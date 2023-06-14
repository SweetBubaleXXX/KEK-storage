import fs from 'fs';

import config from '../config';

export function StorageSpace() {
  return {
    used: 0,
    get capacity() {
      return config.STORAGE_SIZE_LIMIT;
    },
    calculate() {
      this.used = getFolderSize();
    }
  }
}

export function createFolderIfNotExists() {
  if (!fs.existsSync(config.STORAGE_PATH)) {
    fs.mkdirSync(config.STORAGE_PATH, {
      recursive: true,
      mode: config.FILE_MODE
    });
    console.log(`Directory ${config.STORAGE_PATH} created`);
  }
}

export function getFolderSize() {
  let totalSize = 0;
  fs.readdirSync(config.STORAGE_PATH).forEach(childName => {
    const stats = fs.statSync(`${config.STORAGE_PATH}/${childName}`);
    if (stats.isFile())
      totalSize += stats.size;
  });
  return totalSize;
}

export const storageSpace = new StorageSpace();
