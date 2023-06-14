import os from 'os';
import path from 'path';
import { mkdtemp } from 'fs/promises';

import config from '../config';
import { storageSpace } from '../utils/storage.utils';

async function setUpTestStorage() {
  const tmpStoragePath = await mkdtemp(path.join(os.tmpdir(), 'KEK-storage-'));
  config.STORAGE_PATH = tmpStoragePath;
  storageSpace.calculate();
}

export default setUpTestStorage;
