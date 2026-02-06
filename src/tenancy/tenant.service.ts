import prisma from '../lib/prisma.js';
// Service for tenant-related operations
export async function createTenant(name:string, slug: string) {
    return prisma.tenant.create({data:{name, slug}});

}
// Service to get tenant by slug
export async function  getTenantBySlug(slug:string) {
    return prisma.tenant.findUnique({where: {slug}});

}
