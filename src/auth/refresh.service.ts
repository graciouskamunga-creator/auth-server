import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import * as tokenService from '../tokens/token.service.js';


export async function rotateRefreshToken(oldToken:string) {
    const payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!) as any;


    const stored = await prisma.refreshToken.findFirst({
        where: {userId: payload.sub, revoked: false}
    });

    if (!stored) throw new Error('Invalid refresh token');

    await prisma.refreshToken.update ({
        where: {id: stored.id},
        data: {revoked:true}
    });

    const newRefreshToken = tokenService.generateRefreshToken({
        sub: payload.sub,
        tenant: payload.tenant
    });

    return newRefreshToken;
    
}