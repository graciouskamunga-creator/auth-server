import {Router} from 'express';
import {registerHandler,loginHandler,refreshHandler,logoutHandler, registerValidation} from './auth.controller.js';
import {authenticate} from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerValidation, registerHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', authenticate, logoutHandler);

export default router;
