import prisma from '../lib/prisma.js';

export async function logout(userId:string) {
    await prisma.refreshToken.updateMany ({
        where: {userId},
        data: {revoked: true}
    });

}
