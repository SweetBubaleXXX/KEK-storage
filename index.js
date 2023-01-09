const app = require('express')();

const { PORT } = require('./config');
const { removeOldFiles } = require('./utils/fileUtils');
const infoControllers = require('./controllers/infoControllers');
const fileControllers = require('./controllers/fileControllers');
const authenticationMiddleware = require('./middleware/authenticationMiddleware');

removeOldFiles(err => { if (err) console.error(err) });

app.use(authenticationMiddleware.authenticate);

app.get('/storage', infoControllers.storageSize);

app.get('/download/:fileId', fileControllers.download);

app.post('/upload/:fileId', fileControllers.upload);

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
