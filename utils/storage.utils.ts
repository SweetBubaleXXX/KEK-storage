import fs, { stat } from 'fs';
import path from 'path';

import { config } from '../config';

class StorageSpace {
  used: number = 0;
  reservedForBackups: number = 0;

  get capacity(): number {
    return config.STORAGE_SIZE_LIMIT;
  }

  calculate() {
    this.used = 0;
    this.reservedForBackups = 0;
    fs.readdirSync(config.STORAGE_PATH).forEach(childName => {
      const stats = fs.statSync(path.join(config.STORAGE_PATH, childName));
      if (!stats.isFile()) return;
      if (childName.endsWith('.bak'))
        this.reservedForBackups += stats.size;
      else
        this.used += stats.size;
    });
  }

  toJSON() {
    return {
      used: this.used,
      capacity: this.capacity,
    };
  }
};

export function createFolderIfNotExists() {
  if (!fs.existsSync(config.STORAGE_PATH)) {
    fs.mkdirSync(config.STORAGE_PATH, {
      recursive: true,
      mode: config.FILE_MODE
    });
    console.log(`Directory ${config.STORAGE_PATH} created`);
  }
}

export const storageSpace = new StorageSpace();
