const fs = require('fs');
const { StatusCodes } = require('http-status-codes');

const { moveFile, writeFile } = require('../utils/file.utils');
const { storageSpace } = require('../utils/storage.utils');

exports.download = (req, res) => {
    if (!req.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
    const stream = fs.createReadStream(req.filePath);
    stream.on('error', err => {
        console.error(err);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
    stream.pipe(res);
};

exports.upload = async (req, res) => {
    const fileSize = +req.headers['file-size'];
    if (!fileSize) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
    const fileIsTooBig = storageSpace.used + fileSize > storageSpace.capacity;
    if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

    const backupFilePath = `${req.filePath}.old`;
    let existingFileSize = 0;
    if (req.fileExists) {
        existingFileSize = fs.statSync(req.filePath).size;
        await moveFile(req.filePath, backupFilePath);
    }
    writeFile(req)
        .then(() => {
            storageSpace.used += (+req.headers['file-size'] - existingFileSize);
            res.sendStatus(StatusCodes.OK);
        })
        .catch(err => {
            if (req.fileExists) moveFile(backupFilePath, req.filePath);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        });
};

exports.delete = (req, res) => {
    if (!req.fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
    fs.unlink(req.filePath, err => {
        if (err) {
            console.error(err);
            return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
        res.sendStatus(StatusCodes.OK);
    })
};
