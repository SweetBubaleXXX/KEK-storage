require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    STORAGE_PATH: process.env.STORAGE_PATH || __dirname,
    STORAGE_SIZE_TIMIT: process.env.STORAGE_SIZE_TIMIT,
    STORAGE_ID: process.env.STORAGE_ID,
    TOKEN_SALT: process.env.TOKEN_SALT || '',
    ALLOWED_TOKENS: (process.env.ALLOWED_TOKENS || '').split('|')
};