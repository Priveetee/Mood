import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		return json({ error: 'Non autorisé' }, { status: 401 });
	}

	const { name } = await request.json();

	if (!name) {
		return json({ error: 'Le nom de la campagne est requis.' }, { status: 400 });
	}

	const campaign = await prisma.campaign.create({
		data: {
			name
		}
	});

	return json({ campaign }, { status: 201 });
};
