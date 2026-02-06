import {Router} from 'express';
import passport from 'passport';
import {generateAccessToken, generateRefreshToken} from '../tokens/token.service.js';
// Google OAuth routes
const router = Router();

router.get('/google', passport.authenticate('google', {scope: ['email', 'profile']})
);

router.get('/google/callback', passport.authenticate('google', {session: false}),
(req, res)=>{
    const user = req.user as any;
    const tenantId = (req as any).tenant.id;


    const accessToken = generateAccessToken({
        sub: user.id,
        tenant: tenantId
    });

    const refreshToken = generateRefreshToken({
    sub: user.id,
    tenant: tenantId
});

res.redirect(`$ {process.env.CLIENT_REDIRECT_URL}? token=${accessToken}`);});

export default router;
