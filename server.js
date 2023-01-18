const app = require('./app');
const { PORT } = require('./config');
const { removeOldFilesPromise } = require('./utils/file.utils');
const { storageSpace } = require('./utils/storage.utils');

removeOldFilesPromise()
    .then(storageSpace.calculate)
    .catch(console.error);

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
