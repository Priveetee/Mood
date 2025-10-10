import prisma from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	const userCount = await prisma.user.count();

	if (userCount > 0) {
		throw redirect(302, '/admin/login');
	}

	return {};
};
