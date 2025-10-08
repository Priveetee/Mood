import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/core/providers/credentials';
import { env } from '$env/dynamic/private';

export const { handle } = SvelteKitAuth({
	providers: [
		Credentials({
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (
					credentials?.username === env.ADMIN_USERNAME &&
					credentials?.password === env.ADMIN_PASSWORD
				) {
					return { id: '1', name: 'Admin' };
				}
				return null;
			}
		})
	],
	secret: env.AUTH_SECRET,
	trustHost: true
});
