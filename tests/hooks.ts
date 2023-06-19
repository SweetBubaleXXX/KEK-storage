import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { mkdtemp } from 'fs/promises';

import { config } from '../config';
import Config from '../utils/config.utils';
import { storageSpace } from '../utils/storage.utils';

export function setUpTestConfig() {
  config.update(new Config('.env.test', true))
};

export async function setUpTestStorage(): Promise<void> {
  const tmpStoragePath = await mkdtemp(path.join(os.tmpdir(), 'KEK-storage-'));
  config.STORAGE_PATH = tmpStoragePath;
  storageSpace.calculate();
};

export async function clearTestStorage(): Promise<void> {
  await fs.rm(config.STORAGE_PATH, {
    force: true,
    recursive: true
  });
};
