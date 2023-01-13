const app = require('express')();

const { PORT } = require('./config');
const { removeOldFiles } = require('./utils/fileUtils');
const infoControllers = require('./controllers/infoControllers');
const fileControllers = require('./controllers/fileControllers');
const { authenticate } = require('./middleware/authentication');

removeOldFiles(err => { if (err) console.error(err) });

app.use(authenticate);

app.get('/space', infoControllers.storageSpace);

app.get('/download/:fileId', fileControllers.download);

app.post('/upload/:fileId', fileControllers.upload);

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
