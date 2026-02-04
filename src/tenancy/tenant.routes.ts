import {Router} from 'express';
import {createTenantHandler} from './tenant.controller.js';

const router = Router();
router.post('/', createTenantHandler);

export default router;