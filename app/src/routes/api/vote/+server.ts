// src/routes/api/vote/+server.ts
import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { pollId, mood, comment } = await request.json();

		if (!pollId || !mood) {
			return json({ error: 'Données manquantes' }, { status: 400 });
		}

		const poll = await prisma.poll.findUnique({ where: { id: pollId } });

		if (!poll || poll.closed) {
			return json({ error: 'Sondage invalide ou fermé' }, { status: 403 });
		}

		await prisma.vote.create({
			data: {
				pollId,
				mood,
				comment: comment || null
			}
		});

		return json({ success: true }, { status: 201 });
	} catch (e) {
		console.error('API Vote Error:', e);
		return json({ error: 'Erreur serveur' }, { status: 500 });
	}
};
