const { StatusCodes } = require('http-status-codes');

const { STORAGE_SIZE_LIMIT } = require('../config');
const { getFolderSize } = require('../utils/storageSizeUtils');

exports.storageSize = (req, res) => {
    getFolderSize((err, bytes) => {
        if (err) res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        res.send({
            used: bytes,
            capacity: STORAGE_SIZE_LIMIT
        });
    });
}