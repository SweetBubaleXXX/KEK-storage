const { execFile } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const app = require('express')();

const { PORT, STORAGE_PATH, STORAGE_SIZE_LIMIT } = require('./config');
const middlewares = require('./middlewares');

function getFolderSize(callback) {
    execFile('du', ['-sb', '.'], { cwd: STORAGE_PATH }, (err, stdout) => {
        if (err) callback(err);
        const match = /^\d+/.exec(stdout);
        const bytes = Number(match[0]);
        callback(null, bytes);
    });
}

const uploadFile = req => {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(path.join(
            STORAGE_PATH,
            req.params.fileId
        ));
        stream.on('open', () => {
            console.log('0%');
            req.pipe(stream);
        });
        stream.on('drain', () => {
            const written = parseInt(stream.bytesWritten);
            const total = parseInt(req.headers['content-length']);
            const pWritten = (written / total) * 100;
            if (!(pWritten % Math.floor(pWritten))) console.log(`Processing  ...  ${pWritten}% done`);
        });
        stream.on('close', () => {
            console.log('100%');
            fs.chmod(path.join(STORAGE_PATH, req.params.fileId), fs.constants.S_IWUSR);
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
    uploadFile(req)
        .then(() => { res.sendStatus(200) })
        .catch(err => { res.status(500).send(err) });
});

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
