import { redirect } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const load = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) {
		throw redirect(303, '/admin/login');
	}

	// On récupère TOUS les votes de TOUS les sondages
	const allVotes = await prisma.vote.findMany({
		orderBy: {
			createdAt: 'asc'
		}
	});

	return { session, allVotes };
};
