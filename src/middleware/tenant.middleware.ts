import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = req.headers['x-tenant-slug'] as string;

    if (!slug) {
      return res.status(400).json({ message: 'Tenant header missing' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    (req as any).tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
}
