const fs = require('fs');
const path = require('path');
const app = require('express')();

const { PORT, STORAGE_PATH, STORAGE_SIZE_LIMIT } = require('./config');
const { getFolderSize, getFolderSizeSync } = require('./utils');
const middlewares = require('./middlewares');

let usedSpace = getFolderSizeSync();

const uploadFile = req => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(STORAGE_PATH, req.params.fileId);
        const stream = fs.createWriteStream(filePath);
        stream.on('open', () => {
            req.pipe(stream);
        });
        stream.on('drain', () => { });
        stream.on('close', () => {
            if (stream.bytesWritten !== +req.headers['file-size']) {
                reject('File wasn\'t written successfully');
            }
            fs.chmod(
                path.join(STORAGE_PATH, req.params.fileId),
                fs.constants.S_IWUSR,
                err => {
                    if (err) reject(err);
                }
            );
            resolve(req.params.fileId);
        });
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });
};

app.use(middlewares.authenticate);

app.get('/space', (req, res) => {
    getFolderSize((err, bytes) => {
        if (err) res.status(500).send(err);
        res.send({
            used: bytes,
            capacity: STORAGE_SIZE_LIMIT
        });
    });
});

app.get('/download/:fileId', (req, res) => {
    const stream = fs.createReadStream(path.join(
        STORAGE_PATH,
        req.params.fileId
    ));
    stream.on('error', err => {
        res.status(500).send(err);
    });
    stream.pipe(res);
});

app.post('/upload/:fileId', (req, res) => {
    const fileSize = +req.headers['file-size'];
    const fileIsTooBig = usedSpace + fileSize > STORAGE_SIZE_LIMIT;
    if (!fileSize || fileIsTooBig) return res.sendStatus(413);
    usedSpace += +req.headers['file-size'];
    uploadFile(req)
        .then(() => { res.sendStatus(200) })
        .catch(err => {
            usedSpace -= +req.headers['file-size'];
            res.status(500).send(err)
        });
});

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
