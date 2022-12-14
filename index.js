const fs = require('fs');
const path = require('path');
const app = require('express')();
require('dotenv').config();

const middlewares = require('./middlewares')

const PORT = process.env.PORT || 3000;
const STORAGE_PATH = process.env.STORAGE_PATH || __dirname;

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
