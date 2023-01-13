const { storageSpace } = require('../utils/storageUtils');

exports.storageSpace = (req, res) => {
    res.send(storageSpace);
}