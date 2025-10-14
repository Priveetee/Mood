import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	console.log('--- [ADMIN DASHBOARD] Chargement des données serveur ---');
	const session = await event.locals.auth();
	if (!session?.user) {
		console.log('[ADMIN DASHBOARD] Pas de session, redirection vers login.');
		throw redirect(303, '/admin/login');
	}

	console.log('[ADMIN DASHBOARD] Session valide, récupération des campagnes...');
	try {
		const campaigns = await prisma.campaign.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				polls: {
					include: {
						_count: {
							select: { votes: true }
						}
					}
				}
			}
		});

		console.log(`[ADMIN DASHBOARD] ${campaigns.length} campagne(s) trouvée(s) dans la base de données.`);

		const allVotes = await prisma.vote.findMany({
			orderBy: { createdAt: 'asc' }
		});

		const formattedVotes = allVotes.map((v) => ({
			createdAt: v.createdAt,
			value: { vert: 4, bleu: 3, orange: 2, rouge: 1 }[v.mood] || 0
		}));
		
		console.log('[ADMIN DASHBOARD] Données chargées et retournées au client.');
		return { session, campaigns, allVotes: formattedVotes };

	} catch (error) {
		console.error('[ADMIN DASHBOARD] ERREUR LORS DE LA RÉCUPÉRATION DES DONNÉES:', error);
		return { session, campaigns: [], allVotes: [] };
	}
};
