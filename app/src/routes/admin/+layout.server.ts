import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	console.log('--- [Gatekeeper Layout Admin] Vérification de la session ---');
	const session = await locals.auth();

	console.log('[Gatekeeper Layout Admin] Session trouvée:', session);

	if (!session && url.pathname !== '/admin/login' && url.pathname !== '/admin/register') {
		console.log('[Gatekeeper Layout Admin] PAS de session. Redirection vers /admin/login');
		throw redirect(303, '/admin/login');
	}

	console.log('[Gatekeeper Layout Admin] Session valide ou page publique. Accès autorisé.');
	return {
		session
	};
};
