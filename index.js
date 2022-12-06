const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = require('express')();

const PORT = process.env.PORT || 3000;
const STORAGE_PATH = process.env.STORAGE_PATH || __dirname;
const TOKEN_SALT = process.env.TOKEN_SALT || '';
const ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || '').split(';');

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
            resolve(req.params.fileId);
        });
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });
};

app.use((req, res, next) => {
    if (!req.headers.authorization) return res.sendStatus(401);
    const [scheme, jwt] = req.headers.authorization.split(' ');
    if (scheme.toLowerCase() !== 'bearer') return res.sendStatus(401);
    const jwtParts = jwt.split('.');
    const [header, payload] = jwtParts.slice(0, 2).map(str => {
        return JSON.parse(Buffer.from(str, 'base64url').toString());
    });
    if (header.alg.toLowerCase() !== 'hs256') return res.sendStatus(401);
    if (!ALLOWED_TOKENS.includes(payload.sub)) return res.sendStatus(403);
    const signature = crypto
        .createHmac('SHA256', TOKEN_SALT)
        .update(jwtParts.slice(0, 2).join('.'))
        .digest('base64url');
    if (signature !== jwtParts[2]) return res.sendStatus(403);
    next();
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
