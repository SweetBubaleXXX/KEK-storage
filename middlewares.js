const crypto = require('crypto');

const STORAGE_ID = process.env.STORAGE_ID
const TOKEN_SALT = process.env.TOKEN_SALT || '';
const ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || '').split('|');

module.exports.authenticate = (req, res, next) => {
    if (!req.headers.authorization) return res.sendStatus(401);
    const [scheme, jwt] = req.headers.authorization.split(' ');
    if (scheme.toLowerCase() !== 'bearer') return res.sendStatus(401);
    const jwtParts = jwt.split('.');
    const [header, payload] = jwtParts.slice(0, 2).map(str => {
        return JSON.parse(Buffer.from(str, 'base64url').toString());
    });
    if (header.alg.toLowerCase() !== 'hs256') return res.sendStatus(401);
    if (!ALLOWED_TOKENS.includes(payload.sub) || payload.iss !== STORAGE_ID) {
        return res.sendStatus(403)
    };
    const signature = crypto
        .createHmac('SHA256', TOKEN_SALT)
        .update(jwtParts.slice(0, 2).join('.'))
        .digest('base64url');
    if (signature !== jwtParts[2]) return res.sendStatus(403);
    next();
}