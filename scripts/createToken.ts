import crypto from 'crypto';

import config from '../config';

if (!(config.TOKEN_SALT && config.STORAGE_ID)) {
    console.error(
        '\x1b[31mTOKEN_SALT and STORAGE_ID env variables must be set!!!\x1b[0m'
    );
    process.exit(1);
}

if (!process.argv[2]) {
    console.error('\x1b[31mRequired positional argument [IP address]\x1b[0m');
    process.exit(1);
}

const head = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
})).toString('base64url');

const payload = Buffer.from(JSON.stringify({
    iss: config.STORAGE_ID,
    sub: process.argv[2], // IP address
    iat: Math.floor(+new Date() / 1000)
})).toString('base64url');

const signature = crypto
    .createHmac('SHA256', config.TOKEN_SALT)
    .update(`${head}.${payload}`)
    .digest('base64url');

console.log(`${head}.${payload}.${signature}`);
