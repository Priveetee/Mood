// src/routes/api/admin/create-poll/+server.ts
import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) return json({ error: 'Non autorisé' }, { status: 401 });

	const poll = await prisma.poll.create({ data: {} });

	return json({ poll });
};
