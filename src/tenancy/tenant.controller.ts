import type {Request, Response} from 'express';
import {createTenant} from './tenant.service.js';
// Controller for tenant-related endpoints
export async function createTenantHandler(req: Request, res: Response) {

    const {name, slug} = req.body;

    try{
        const tenant = await createTenant(name, slug);
        res.status(201).json(tenant);
    }catch{
        res.status(400).json({message: 'Tenant alreday exists'});
    }
    
}
// Controller to get tenant branding info
export async function getTenatBranding(req: Request, res: Response) {
    const tenant = (req as any).tenant;

    res.json({
        name:tenant.name,
        logo:tenant.logoUrl,
        color:tenant.primaryColor
    });
}