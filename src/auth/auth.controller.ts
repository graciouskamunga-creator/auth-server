import type {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import Joi from 'joi';
import * as authService from './auth.service.js';
import logger from '../utils/logger.js';

// Validation schema for registration
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

// Express-validator middleware for registration
export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
];

// Validation schema for login
export async function registerHandler(req:Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password} = req.body;
    const tenant = (req as any).tenant;

try{
    const user = await authService.register(email, password, tenant.slug);
    logger.info(`User registered: ${email} for tenant: ${tenant.slug}`);
    res.status(201).json(user);
}catch(err:any) {
    logger.warn(`Registration failed: ${email} - ${err.message}`);
    res.status(400).json({message:err.message});
}

}

// Express-validator middleware for login
export async function loginHandler(req:Request, res: Response) {
    const {email, password} = req.body;
    const tenant = (req as any).tenant;

    try{
        const tokens =await authService.login(email, password, tenant.slug);
        logger.info(`User logged in: ${email} for tenant: ${tenant.slug}`);
        res.json(tokens);
    }catch (err:any){
        logger.warn(`Login failed: ${email} - ${err.message}`);
        res.status(401).json({message: err.message});

    }

}

// Token refresh handler
export async function refreshHandler(req:Request, res: Response) {
    const {refreshToken} = req.body;

    try{
        const tokens = await authService.refresh(refreshToken); res.json(tokens);
    }catch{
        res.status(401).json({message: 'Invalid refresh token'});
    }
    
} 

// Logout handler
export async function logoutHandler(req:Request, res: Response) {
    const user = (req as any).user;

    await authService.logout(user.sub);
    res.json({message: 'Logged out from all devices'})
    
}