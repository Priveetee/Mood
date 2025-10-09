import { PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {
	const poll = await prisma.poll.findUnique({
		where: {
			id: params.id
		}
	});

	// Si le sondage n'existe pas ou est déjà fermé, on renvoie une erreur 404.
	if (!poll || poll.closed) {
		throw error(404, 'Sondage non trouvé ou fermé.');
	}

	// Si tout va bien, on renvoie les données du sondage à la page.
	return { poll };
};
