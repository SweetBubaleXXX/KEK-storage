import app from './app';
import { config } from './config';
import { rotateBackupsPromise } from './utils/file.utils';
import { createFolderIfNotExists, storageSpace } from './utils/storage.utils';

createFolderIfNotExists();
rotateBackupsPromise()
  .then(storageSpace.calculate)
  .catch(console.error);

app.listen(config.PORT, () => {
  console.log(`Running on PORT - ${config.PORT}`);
  console.log(`Storage path: ${config.STORAGE_PATH}`);
  console.log(`Used ${storageSpace.used} of ${storageSpace.capacity} bytes`);
});
