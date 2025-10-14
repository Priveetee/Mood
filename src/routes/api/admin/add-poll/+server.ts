import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		return json({ error: 'Non autorisé' }, { status: 401 });
	}

	const { campaignId, managerName } = await request.json();

	if (!campaignId || !managerName) {
		return json({ error: 'Le nom du manager et l\'ID de la campagne sont requis.' }, { status: 400 });
	}

	const poll = await prisma.poll.create({
		data: {
			managerName,
			campaignId
		}
	});

	return json({ poll }, { status: 201 });
};
