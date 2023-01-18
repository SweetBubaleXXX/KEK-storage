const fs = require('fs/promises');

const config = require('../config');

async function clearTestStorage() {
    await fs.rm(config.STORAGE_PATH, {
        force: true,
        recursive: true
    });
}

module.exports = clearTestStorage;
