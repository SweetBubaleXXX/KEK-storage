const crypto = require('crypto');

if (!process.env.TOKEN_SALT) {
    console.error('\x1b[31mTOKEN_SALT env variable not set!!!\x1b[0m');
    process.exit(1);
}

const head = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'jwt'
})).toString('base64url');

const payload = Buffer.from(JSON.stringify({
    sub: process.argv[2], // IP address
    iat: Math.floor(+new Date() / 1000)
})).toString('base64url');

const signature = crypto
    .createHmac('SHA256', process.env.TOKEN_SALT)
    .update(`${head}.${payload}`)
    .digest('base64url');

console.log(`${head}.${payload}.${signature}`);
