const dotenv = require('dotenv');
const path = require('path');

function Config(configPath, override = false) {
    dotenv.config({ path: configPath, override });
    this.PORT = +process.env.PORT || 3000;
    this.STORAGE_PATH = path.resolve(__dirname, '..', process.env.STORAGE_PATH || '');
    this.STORAGE_SIZE_LIMIT = +process.env.STORAGE_SIZE_LIMIT;
    this.STORAGE_ID = process.env.STORAGE_ID;
    this.TOKEN_SALT = process.env.TOKEN_SALT || '';
    this.ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || '').split('|');
}

module.exports = Config;
