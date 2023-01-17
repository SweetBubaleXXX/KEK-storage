const fs = require('fs');
const path = require('path');

const config = require('../config');

function moveFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, err => {
            if (err) reject(err);
            resolve();
        });
    });
}

function removeOldFiles(callback) {
    fs.readdir(config.STORAGE_PATH, (err, files) => {
        if (err) return callback && callback(err);
        files.forEach(filename => {
            if (filename.endsWith('.old')) {
                fs.unlink(
                    path.join(config.STORAGE_PATH, filename),
                    err => { if (err) callback && callback(err) }
                );
            }
        });
    });
}

function writeFile(req) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(config.STORAGE_PATH, req.params.fileId);
        const stream = fs.createWriteStream(filePath);
        stream.on('open', () => {
            req.pipe(stream);
        });
        stream.on('drain', () => { });
        stream.on('close', () => {
            if (stream.bytesWritten !== +req.headers['file-size']) {
                reject(
                    'File wasn\'t written properly. ' +
                    `Expected size ${req.headers['file-size']}, ` +
                    `actual size ${stream.bytesWritten} bytes.`
                );
            }
            fs.chmodSync(
                path.join(config.STORAGE_PATH, req.params.fileId),
                fs.constants.S_IRUSR | fs.constants.S_IWUSR | fs.constants.S_IRGRP
            );
            resolve(req.params.fileId);
        });
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });
}

module.exports = {
    moveFile,
    removeOldFiles,
    writeFile
};
