const { storageSpace } = require('../utils/storage.utils');

exports.storageSpace = (req, res) => {
    res.send(storageSpace);
}
