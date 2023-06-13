import app from './app';
import config from './config';
import { removeOldFilesPromise } from './utils/file.utils';
import { createFolderIfNotExists, storageSpace } from './utils/storage.utils';

createFolderIfNotExists();
removeOldFilesPromise()
    .then(storageSpace.calculate)
    .catch(console.error);

app.listen(config.PORT, () => {
    console.log(`Running on PORT - ${config.PORT}`);
});
