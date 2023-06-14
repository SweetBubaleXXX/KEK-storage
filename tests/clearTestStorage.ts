import fs from 'fs/promises';

import config from '../config';

async function clearTestStorage() {
  await fs.rm(config.STORAGE_PATH, {
    force: true,
    recursive: true
  });
}

export default clearTestStorage;
