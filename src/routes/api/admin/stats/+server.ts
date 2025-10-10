import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		return json({ error: 'Non autorisé' }, { status: 401 });
	}

	try {
		const allVotes = await prisma.vote.findMany({
			orderBy: { createdAt: 'asc' }
		});

		return json({
			lineChartData: allVotes.map((v) => ({
				date: v.createdAt,
				value: { vert: 4, bleu: 3, orange: 2, rouge: 1 }[v.mood] || 0
			}))
		});
	} catch (error) {
		console.error('API Stats Error:', error);
		return json({ error: 'Erreur serveur' }, { status: 500 });
	}
};
