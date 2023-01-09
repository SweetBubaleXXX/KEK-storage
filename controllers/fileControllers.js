const fs = require('fs');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const { STORAGE_PATH, STORAGE_SIZE_LIMIT } = require('../config');
const { moveFile, writeFile } = require('../utils/fileUtils');
let { usedSpace } = require('../utils/storageSizeUtils');

exports.download = (req, res) => {
    const filePath = path.join(STORAGE_PATH, req.params.fileId)
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) return res.sendStatus(StatusCodes.NOT_FOUND);
    const stream = fs.createReadStream(path.join(
        STORAGE_PATH,
        req.params.fileId
    ));
    stream.on('error', err => {
        res.status(500).send(err);
    });
    stream.pipe(res);
};

exports.upload = async (req, res) => {
    const fileSize = +req.headers['file-size'];
    const fileIsTooBig = usedSpace + fileSize > STORAGE_SIZE_LIMIT;
    if (!fileSize) return res.sendStatus(StatusCodes.LENGTH_REQUIRED);
    if (fileIsTooBig) return res.sendStatus(StatusCodes.REQUEST_TOO_LONG);

    const filePath = path.join(STORAGE_PATH, req.params.fileId)
    const backupFilePath = `${filePath}.old`;
    const fileExists = fs.existsSync(filePath);
    let existingFileSize = 0;
    if (fileExists) {
        existingFileSize = fs.statSync(filePath).size;
        await moveFile(filePath, backupFilePath);
    }
    writeFile(req)
        .then(() => {
            usedSpace += (+req.headers['file-size'] - existingFileSize);
            res.sendStatus(StatusCodes.OK);
        })
        .catch(err => {
            if (fileExists) moveFile(backupFilePath, filePath);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.toString());
            console.error(err);
        });
};
