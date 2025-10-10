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

	if (!poll || poll.closed) {
		throw error(404, 'Sondage non trouvé ou fermé.');
	}

	return { poll };
};
