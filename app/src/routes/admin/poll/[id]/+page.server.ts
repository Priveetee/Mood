import { PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const load = async ({ params }) => {
	const poll = await prisma.poll.findUnique({
		where: { id: params.id },
		include: {
			votes: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});

	if (!poll) {
		throw error(404, 'Sondage non trouvé');
	}

	return { poll };
};
