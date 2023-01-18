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

function removeOldFilesPromise() {
    return new Promise((resolve, reject) => {
        removeOldFiles(err => {
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
        stream.on('error', err => {
            console.error(err);
            reject('Error occured while writing file');
        });
        stream.on('close', () => {
            if (stream.bytesWritten !== +req.headers['file-size']) {
                return reject(
                    'File wasn\'t written properly. ' +
                    `Expected size ${req.headers['file-size']}, ` +
                    `actual size ${stream.bytesWritten} bytes.`
                );
            }
            fs.chmod(
                path.join(config.STORAGE_PATH, req.params.fileId),
                config.FILE_MODE,
                err => { if (err) console.error(err) }
            );
            resolve(req.params.fileId);
        });
    });
}

module.exports = {
    moveFile,
    removeOldFiles,
    removeOldFilesPromise,
    writeFile
};
