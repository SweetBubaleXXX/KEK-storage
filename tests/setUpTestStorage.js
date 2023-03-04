const os = require('os');
const path = require('path');
const { mkdtemp } = require('fs/promises');

const config = require('../config');
const { storageSpace } = require('../utils/storage.utils');

async function setUpTestStorage() {
    const tmpStoragePath = await mkdtemp(path.join(os.tmpdir(), 'KEK-storage-'));
    config.STORAGE_PATH = tmpStoragePath;
    storageSpace.calculate();
}

module.exports = setUpTestStorage;
