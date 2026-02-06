import prisma from '../lib/prisma.js';
/// Logout method
export async function logout(userId:string) {
    await prisma.refreshToken.updateMany ({
        where: {userId},
        data: {revoked: true}
    });

}
