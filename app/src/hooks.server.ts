// src/hooks.server.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { env } from '$env/dynamic/private';
import prisma from '$lib/server/db';
import bcrypt from 'bcrypt';

export const { handle } = SvelteKitAuth({
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
});
