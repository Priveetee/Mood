// src/routes/api/admin/close-poll/+server.ts
import prisma from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user) return json({ error: 'Non autorisé' }, { status: 401 });

	const { pollId } = await request.json();

	const poll = await prisma.poll.update({
		where: { id: pollId },
		data: { closed: true }
	});

	return json({ poll });
};
