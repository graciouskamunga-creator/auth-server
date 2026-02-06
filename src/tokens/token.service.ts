import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
// Service for token generation
export const generateAccessToken = (payload: any) => jwt.sign(payload, env.jwt.secret, {
    expiresIn: '15m',
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
});
// Service for refresh token generation
export const generateRefreshToken = (payload: any) => jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: '30d',
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
});
