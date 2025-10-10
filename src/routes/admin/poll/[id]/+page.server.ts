import { PrismaClient } from '@prisma/client';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		throw redirect(303, '/admin/login');
	}

	const poll = await prisma.poll.findUnique({
		where: {
			id: params.id
		},
		include: {
			votes: {
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});

	if (!poll) {
		throw error(404, 'Sondage non trouvé');
	}

	return { poll };
};
