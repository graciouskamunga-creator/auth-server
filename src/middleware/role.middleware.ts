import type {Request, Response, NextFunction} from 'express';

export function requireRole(role: 'ADMIN'  | 'USER'){
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;


        if (user.role !== role){
            return res.status(403).json({message: 'Forbidden'});
        }
        next();
    }
}

export function requireRoles(roleName: string){
    return async(req:any, res: any, next:any)=> {
        const roles = req.user.roles;
        if (!roles.includes(roleName)){
            return res.status(403).json({message: 'Forbidden'});
        }
        next();
    }
}