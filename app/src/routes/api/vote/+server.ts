import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

const VALID_MOODS = ['vert', 'bleu', 'orange', 'rouge'] as const;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { pollId, mood, comment } = await request.json();

		if (!pollId || typeof pollId !== 'string') {
			return json({ error: 'pollId manquant ou invalide' }, { status: 400 });
		}

		if (!mood || !VALID_MOODS.includes(mood)) {
			return json({ error: 'mood invalide' }, { status: 400 });
		}

		const poll = await prisma.poll.findUnique({
			where: { id: pollId }
		});

		if (!poll) {
			return json({ error: 'Sondage introuvable' }, { status: 404 });
		}

		if (poll.closed) {
			return json({ error: 'Ce sondage est fermé' }, { status: 403 });
		}

		if (poll.expiresAt && poll.expiresAt < new Date()) {
			return json({ error: 'Ce sondage a expiré' }, { status: 403 });
		}

		const vote = await prisma.vote.create({
			data: {
				pollId,
				mood,
				comment: comment || null
			}
		});

		return json({ success: true, voteId: vote.id }, { status: 201 });
	} catch (error) {
		console.error('Erreur lors du vote:', error);
		return json({ error: 'Erreur serveur' }, { status: 500 });
	}
};
