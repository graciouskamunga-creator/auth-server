import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import authRoutes from './auth/auth.routes.js';
import oauthRoutes from './auth/oauth.routes.js';
import tenantRoutes from './tenancy/tenant.routes.js';
import {resolveTenant} from './middleware/tenant.middleware.js';
import {enforceHttps} from './middleware/https.middleware.js';
import './auth/passport.js'; // initialize passport strategy

const app = express();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


// Tenant resolution (header or domain)
app.use(resolveTenant);

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/auth', oauthRoutes);
app.use('/tenants', tenantRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
