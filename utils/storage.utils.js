const { execFile, execFileSync } = require('node:child_process');

const { STORAGE_PATH, STORAGE_SIZE_LIMIT } = require('../config');

const storageSpace = new StorageSpace();
storageSpace.calculate();

function StorageSpace() {
    this.used = 0;
    this.capacity = STORAGE_SIZE_LIMIT;
    this.calculate = () => {
        this.used = getFolderSizeSync();
    };
}

function getFolderSizeSync() {
    const stdout = execFileSync('du', ['-sb', '.'], { cwd: STORAGE_PATH });
    return _parseDuOutput(stdout);
}

function getFolderSize(callback) {
    execFile('du', ['-sb', '.'], { cwd: STORAGE_PATH }, (err, stdout) => {
        if (err) callback(err);
        callback(null, _parseDuOutput(stdout));
    });
}

function _parseDuOutput(stdout) {
    const match = /^\d+/.exec(stdout);
    return Number(match[0]);
}

module.exports = {
    getFolderSize,
    getFolderSizeSync,
    storageSpace
};
