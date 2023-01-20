const dotenv = require('dotenv');
const path = require('path');
const { constants: modes } = require('fs');

function Config(configPath, override = false) {
    dotenv.config({ path: configPath, override });
    this.PORT = +process.env.PORT || 3000;
    this.STORAGE_PATH = path.resolve(__dirname, '..', process.env.STORAGE_PATH || '');
    this.STORAGE_SIZE_LIMIT = +process.env.STORAGE_SIZE_LIMIT;
    this.STORAGE_ID = process.env.STORAGE_ID;
    this.TOKEN_SALT = process.env.TOKEN_SALT || '';
    this.ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || '').split('|');
    this.FILE_MODE = modes.S_IRUSR | modes.S_IWUSR | modes.S_IXUSR | modes.S_IRGRP;
}

module.exports = Config;
