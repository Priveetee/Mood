import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { env } from '$env/dynamic/private';
import prisma from '$lib/server/db';
import bcrypt from 'bcrypt';
import { sequence } from '@sveltejs/kit/hooks';
import { authLimiter } from '$lib/server/limiter';
import { error } from '@sveltejs/kit';

const { handle: authHandle } = SvelteKitAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (passwordMatch) {
          return { id: user.id, name: user.username };
        }

        return null;
      },
    }),
  ],
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

async function rateLimiterHandle({ event, resolve }) {
  if (
    event.url.pathname.startsWith('/auth/') &&
    event.request.method === 'POST'
  ) {
    const status = await authLimiter.check(event);
    if (status.limited) {
      throw error(429, 'Trop de tentatives. Réessayez dans 1 minute.');
    }
  }

  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const handle = sequence(rateLimiterHandle, authHandle);
