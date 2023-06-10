const app = require('./app');
const { PORT } = require('./config');
const { removeOldFilesPromise } = require('./utils/file.utils');
const { createFolderIfNotExists, storageSpace } = require('./utils/storage.utils');

createFolderIfNotExists();
removeOldFilesPromise()
    .then(storageSpace.calculate)
    .catch(console.error);

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
