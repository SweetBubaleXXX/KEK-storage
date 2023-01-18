const { execFile, execFileSync } = require('node:child_process');

const config = require('../config');

function StorageSpace() {
    return {
        used: 0,
        get capacity() {
            return config.STORAGE_SIZE_LIMIT;
        },
        calculate() {
            this.used = getFolderSizeSync();
        }
    }
}

function getFolderSizeSync() {
    const stdout = execFileSync('du', ['-sb', '.'], { cwd: config.STORAGE_PATH });
    return _parseDuOutput(stdout);
}

function getFolderSize(callback) {
    execFile('du', ['-sb', '.'], { cwd: config.STORAGE_PATH }, (err, stdout) => {
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
    storageSpace: new StorageSpace()
};
