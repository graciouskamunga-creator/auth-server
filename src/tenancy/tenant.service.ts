import prisma from '../lib/prisma.js';

export async function createTenant(name:string, slug: string) {
    return prisma.tenant.create({data:{name, slug}});

}

export async function  getTenantBySlug(slug:string) {
    return prisma.tenant.findUnique({where: {slug}});

}
