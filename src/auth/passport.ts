import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {Strategy as GitHubStrategy} from 'passport-github2';
import prisma from '../lib/prisma.js';

passport.use(new GoogleStrategy({
     clientID: process.env.GOOGLE_CLIENT_ID!,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     callbackURL: '/auth/google/callback'
     },

     async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        const email = profile.emails?.[0].value!;
        const googleId = profile.id;

        let oauth= await prisma.oAuthAccount.findFirst({
            where: {provider: 'GOOGLE', providerUserId: googleId},
            include: {user: true}
        });

        if (!oauth) {
            let user = await prisma.user.findUnique({where:{email}});

            if (!user) {
                user = await prisma.user.create({
                    data:{email, verified: true}
                });
            }
            oauth = await prisma.oAuthAccount.create({
                data: {
                    provider: 'GOOGLE',
                    providerUserId: googleId,
                    userId: user.id
                },
                include: {user: true}
            });
        }
        done(null, oauth.user);
     }
));

        passport.use(new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!, callbackURL: '/auth/github/callback'
            },
            async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
                const githubId = profile.id.toString();
                const email = profile.emails?.[0].value;

                let oauth = await prisma.oAuthAccount.findFirst({
                    where: {provider: 'GITHUB', providerUserId: githubId},
                    include: {user: true}
                });

                if (!oauth) {
                    let user = email ? await prisma.user.findUnique({where:{email}}) : null;

                    if (!user){
                        user = await prisma.user.create({
                            data: {email, verified: true}
                        });
                    }
                    oauth = await prisma.oAuthAccount.create({
                        data: {
                            provider: 'GITHUB',
                            providerUserId: githubId,
                            userId: user.id
                        },
                        include: { user:true}
                    });
                }
                done(null, oauth.user)
            }
        )
    );

export default passport;
