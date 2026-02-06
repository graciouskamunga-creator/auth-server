import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import {generateAccessToken, generateRefreshToken} from '../tokens/token.service.js';


// Register method
export async function register(email:string, password: string, tenantSlug: string) {

    const hash = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.findUnique({where:{slug:tenantSlug}});

    if (!tenant) throw new Error ('Tenant not found');

    const user = await prisma.user.create({data: {email, password: hash}});

    await prisma.tenantUser.create({data: {userId: user.id, tenantId: tenant.id, role: 'USER'}});


    return user;
}

//Login method
export async function login(
    email:  string,
    password: string,
    tenantSlug: string) {
    const user = await prisma.user.findUnique({where:{email}});

    if (!user) throw new Error('Invalid user credentials');

    if (!user.password) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error ('Invalid credentials');

    const tenant = await prisma.tenant.findUnique({where:{slug:tenantSlug}});

    if (!tenant) throw new Error ('Tenant not found');

    const membership = await prisma.tenantUser.findFirst({
        where: {
            userId:user.id,
            tenantId: tenant.id
        }
    });

     if(!membership){
        throw new Error ('user not  part of this tenant');
     }

     const accessToken = generateAccessToken({
        sub: user.id,
        tenant: tenant.id,
        role: membership.role
     });

     const refreshToken = generateRefreshToken({
        sub: user.id,
        tenant: tenant.id
     });

     const tokenHash = await bcrypt.hash(refreshToken, 10);

     await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            tenantId: tenant.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 1000)
        }
     });

return {accessToken, refreshToken};
}

// Refresh token
export async function refresh(refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenEntry = await prisma.refreshToken.findFirst({
        where: { tokenHash }
    });

    if (!refreshTokenEntry || refreshTokenEntry.revoked || refreshTokenEntry.expiresAt < new Date()) {
        if (refreshTokenEntry) {
            await prisma.refreshToken.updateMany({
                where: { userId: refreshTokenEntry.userId },
                data: { revoked: true }
            });
        }
        throw new Error('refresh token compromised');
    }

    // Revoke old token
    await prisma.refreshToken.update({
        where: { id: refreshTokenEntry.id },
        data: { revoked: true }
    });

    // Fetch user role
    const membership = await prisma.tenantUser.findFirst({
        where: {
            userId: refreshTokenEntry.userId,
            tenantId: refreshTokenEntry.tenantId
        }
    });

    if (!membership) throw new Error('User not part of tenant');

    // Issue a new token
    const newRefreshToken = generateRefreshToken({
        sub: refreshTokenEntry.userId,
        tenant: refreshTokenEntry.tenantId
    });

    const newTokenHash = await bcrypt.hash(newRefreshToken, 10);

    const accessToken = generateAccessToken({
        sub: refreshTokenEntry.userId,
        tenant: refreshTokenEntry.tenantId,
        role: membership.role
    });

    await prisma.refreshToken.create({
        data: {
            tokenHash: newTokenHash,
            userId: refreshTokenEntry.userId,
            tenantId: refreshTokenEntry.tenantId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 1000)
        }
    });

    return { accessToken, refreshToken: newRefreshToken };
}
 //Logout method
export async function logout(userId: string) {
   await prisma.refreshToken.updateMany ({
        where: {userId},
        data: {revoked: true}
    });
}

