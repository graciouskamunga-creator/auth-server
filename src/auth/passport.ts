import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * GOOGLE OAUTH
 */
if (env.oauth.googleClientId && env.oauth.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.oauth.googleClientId,
        clientSecret: env.oauth.googleClientSecret,
        callbackURL: '/auth/google/callback',
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(null, false);

          // Resolve tenant (example: default tenant)
          const tenant = await prisma.tenant.findFirst({
            where: { slug: 'default' },
          });

          if (!tenant) throw new Error('Tenant not found');

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                verified: true,
              },
            });
          }

          // Ensure user is part of the tenant
          const existingMembership = await prisma.tenantUser.findFirst({
            where: {
              userId: user.id,
              tenantId: tenant.id,
            },
          });

          if (!existingMembership) {
            await prisma.tenantUser.create({
              data: {
                userId: user.id,
                tenantId: tenant.id,
                role: 'USER',
              },
            });
          }

          await prisma.oAuthAccount.upsert({
            where: {
              provider_providerUserId: {
                provider: 'GOOGLE',
                providerUserId: profile.id,
              },
            },
            update: {},
            create: {
              provider: 'GOOGLE',
              providerUserId: profile.id,
              userId: user.id,
            },
          });

          done(null, user);
        } catch (err) {
          done(err, undefined);
        }
      }
    )
  );
}

/**
 * GITHUB OAUTH
 */
if (env.oauth.githubClientId && env.oauth.githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.oauth.githubClientId,
        clientSecret: env.oauth.githubClientSecret,
        callbackURL: '/auth/github/callback',
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;

          const tenant = await prisma.tenant.findFirst({
            where: { slug: 'default' },
          });

          if (!tenant) throw new Error('Tenant not found');

          let user = email ? await prisma.user.findUnique({
            where: { email },
          }) : null;

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                verified: true,
              },
            });
          }

          // Ensure user is part of the tenant
          const existingMembership = await prisma.tenantUser.findFirst({
            where: {
              userId: user.id,
              tenantId: tenant.id,
            },
          });

          if (!existingMembership) {
            await prisma.tenantUser.create({
              data: {
                userId: user.id,
                tenantId: tenant.id,
                role: 'USER',
              },
            });
          }

          await prisma.oAuthAccount.upsert({
            where: {
              provider_providerUserId: {
                provider: 'GITHUB',
                providerUserId: profile.id.toString(),
              },
            },
            update: {},
            create: {
              provider: 'GITHUB',
              providerUserId: profile.id.toString(),
              userId: user.id,
            },
          });

          done(null, user);
        } catch (err) {
          done(err, undefined);
        }
      }
    )
  );
}

export default passport;
