const { execFile, execFileSync } = require('node:child_process');

const { STORAGE_PATH } = require('../config');

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

module.exports = {
    getFolderSize,
    getFolderSizeSync,
    usedSpace: getFolderSizeSync()
};
