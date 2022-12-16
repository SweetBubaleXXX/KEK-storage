const fs = require('fs');
const { execFile, execFileSync } = require('node:child_process');

const { STORAGE_PATH } = require('./config');

function getFolderSizeSync() {
    const stdout = execFileSync('du', ['-sb', '.'], { cwd: STORAGE_PATH });
    return parseDuOutput(stdout);
}

function getFolderSize(callback) {
    execFile('du', ['-sb', '.'], { cwd: STORAGE_PATH }, (err, stdout) => {
        if (err) callback(err);
        callback(null, parseDuOutput(stdout));
    });
}

function parseDuOutput(stdout) {
    const match = /^\d+/.exec(stdout);
    return Number(match[0]);
}

function moveFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, err => {
            if (err) reject(err);
            resolve();
        });
    });
}

function writeFile(req) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(STORAGE_PATH, req.params.fileId);
        const stream = fs.createWriteStream(filePath);
        stream.on('open', () => {
            req.pipe(stream);
        });
        stream.on('drain', () => { });
        stream.on('close', () => {
            if (stream.bytesWritten !== +req.headers['file-size']) {
                reject('File wasn\'t written properly');
            }
            fs.chmod(
                path.join(STORAGE_PATH, req.params.fileId),
                fs.constants.S_IWUSR,
                err => {
                    if (err) console.error(`CHMOD error: ${err}`);
                }
            );
            resolve(req.params.fileId);
        });
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });
}

function removeOldFiles() { }

module.exports = {
    getFolderSize,
    getFolderSizeSync,
    moveFile,
    writeFile
};
