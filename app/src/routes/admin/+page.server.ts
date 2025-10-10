import { redirect } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) {
		throw redirect(303, '/admin/login');
	}

	const allVotes = await prisma.vote.findMany({
		orderBy: { createdAt: 'asc' }
	});

	return { session, allVotes };
};
