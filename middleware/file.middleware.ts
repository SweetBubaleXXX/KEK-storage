const fs = require('fs');
const path = require('path');

const config = require('../config');

module.exports.checkIfFileExists = (req, res, next) => {
    req.fileExists = fs.existsSync(path.join(config.STORAGE_PATH, req.params.fileId));
    next();
};

module.exports.getFilePath = (req, res, next) => {
    req.filePath = path.join(config.STORAGE_PATH, req.params.fileId);
    next();
};

module.exports.getFileSize = (req, res, next) => {
    req.fileSize = +req.headers['file-size'];
    next();
};
