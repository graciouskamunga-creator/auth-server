import type { Request, Response, NextFunction } from 'express';
// Middleware to enforce HTTPS in production
export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
}
