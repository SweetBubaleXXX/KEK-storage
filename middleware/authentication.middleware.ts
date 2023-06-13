import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import config from '../config';

export function authenticate(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) return res.sendStatus(StatusCodes.UNAUTHORIZED);
    const [scheme, jwt] = req.headers.authorization.split(' ');
    if (scheme.toLowerCase() !== 'bearer') return res.sendStatus(StatusCodes.UNAUTHORIZED);
    const jwtParts = jwt.split('.');
    const [header, payload] = jwtParts.slice(0, 2).map(str => {
        return JSON.parse(Buffer.from(str, 'base64url').toString());
    });
    if (header.typ.toLowerCase() !== 'jwt' || header.alg.toLowerCase() !== 'hs256') {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
    if (!config.ALLOWED_TOKENS.includes(payload.sub) || payload.iss !== config.STORAGE_ID) {
        return res.sendStatus(StatusCodes.FORBIDDEN);
    };
    const signature = crypto
        .createHmac('SHA256', config.TOKEN_SALT)
        .update(jwtParts.slice(0, 2).join('.'))
        .digest('base64url');
    if (signature !== jwtParts[2]) return res.sendStatus(StatusCodes.FORBIDDEN);
    next();
};
