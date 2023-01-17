const fs = require('fs');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const config = require('../config');
const { moveFile, writeFile } = require('../utils/file.utils');
const { storageSpace } = require('../utils/storage.utils');

exports.download = (req, res) => {
    const filePath = path.join(config.STORAGE_PATH, req.params.fileId)
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
    const stream = fs.createReadStream(path.join(
        config.STORAGE_PATH,
        req.params.fileId
    ));
    stream.on('error', err => {
        res.status(500).send(err);
    });
    stream.pipe(res);
};

exports.upload = async (req, res) => {
    const fileSize = +req.headers['file-size'];
    const fileIsTooBig = storageSpace.used + fileSize > storageSpace.capacity;
    if (!fileSize) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
    if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

    const filePath = path.join(config.STORAGE_PATH, req.params.fileId)
    const backupFilePath = `${filePath}.old`;
    const fileExists = fs.existsSync(filePath);
    let existingFileSize = 0;
    if (fileExists) {
        existingFileSize = fs.statSync(filePath).size;
        await moveFile(filePath, backupFilePath);
    }
    writeFile(req)
        .then(() => {
            storageSpace.used += (+req.headers['file-size'] - existingFileSize);
            res.sendStatus(StatusCodes.OK);
        })
        .catch(err => {
            if (fileExists) moveFile(backupFilePath, filePath);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.toString());
            console.error(err);
        });
};
