const { storageSpace } = require('../utils/storage.utils');

exports.storageSpace = (req, res) => {
    res.send({
        used: storageSpace.used,
        capacity: storageSpace.capacity
    });
};
