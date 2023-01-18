const os = require('os');
const path = require('path');
const { mkdtemp } = require('fs/promises');

const config = require('../config');

async function setUpTestStorage() {
    const tmpStoragePath = await mkdtemp(path.join(os.tmpdir(), 'KEK-storage-'));
    config.STORAGE_PATH = tmpStoragePath;
}

module.exports = setUpTestStorage;
