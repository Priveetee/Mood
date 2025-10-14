import prisma from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		throw redirect(303, '/admin/login');
	}

	const campaign = await prisma.campaign.findUnique({
		where: {
			id: params.id
		},
		include: {
			polls: {
				orderBy: {
					createdAt: 'desc'
				},
				include: {
					_count: {
						select: { votes: true }
					}
				}
			}
		}
	});

	if (!campaign) {
		throw error(404, 'Campagne non trouvée');
	}

	return { campaign };
};
