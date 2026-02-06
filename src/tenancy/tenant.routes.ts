import {Router} from 'express';
import {createTenantHandler} from './tenant.controller.js';
// Routes for tenant management
const router = Router();
router.post('/', createTenantHandler);

export default router;