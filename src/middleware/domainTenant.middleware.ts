import type {Request, Response, NextFunction} from 'express';
import prisma from '../lib/prisma.js';

export async function resolveTenantByDomain(
    req: Request, res: Response, next: NextFunction
) {
    const host = req.headers.host as string;

    const tenant = await prisma.tenant.findUnique({
        where: {domain: host}
    });

    if (!tenant) return next(); // fallback to header-based

    (req as any).tenant = tenant;
    next();
}

