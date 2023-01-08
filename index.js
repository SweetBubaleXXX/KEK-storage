const fs = require('fs');
const path = require('path');
const app = require('express')();

const { PORT, STORAGE_PATH, STORAGE_SIZE_LIMIT } = require('./config');
const {
    getFolderSize,
    getFolderSizeSync,
    moveFile,
    removeOldFiles,
    writeFile
} = require('./utils');
const middlewares = require('./middlewares');

removeOldFiles(err => { if (err) console.error(err) });
let usedSpace = getFolderSizeSync();

app.use(middlewares.authenticate);

app.get('/storage', (req, res) => {
    getFolderSize((err, bytes) => {
        if (err) res.status(500).send(err);
        res.send({
            used: bytes,
            capacity: STORAGE_SIZE_LIMIT
        });
    });
});

app.get('/download/:fileId', (req, res) => {
    const filePath = path.join(STORAGE_PATH, req.params.fileId)
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) return res.sendStatus(404);
    const stream = fs.createReadStream(path.join(
        STORAGE_PATH,
        req.params.fileId
    ));
    stream.on('error', err => {
        res.status(500).send(err);
    });
    stream.pipe(res);
});

app.post('/upload/:fileId', async (req, res) => {
    const fileSize = +req.headers['file-size'];
    const fileIsTooBig = usedSpace + fileSize > STORAGE_SIZE_LIMIT;
    if (!fileSize || fileIsTooBig) return res.sendStatus(413);

    const filePath = path.join(STORAGE_PATH, req.params.fileId)
    const backupFilePath = `${filePath}.old`;

    let existingFileSize = 0;
    if (fileExists) {
        existingFileSize = fs.statSync(filePath).size;
        await moveFile(filePath, backupFilePath);
    }
    writeFile(req)
        .then(() => {
            usedSpace += (+req.headers['file-size'] - existingFileSize);
            res.sendStatus(200);
        })
        .catch(err => {
            if (fileExists) moveFile(backupFilePath, filePath);
            res.status(500).send(err);
        });
});

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
