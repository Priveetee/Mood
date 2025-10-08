import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
export const POST = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) return json({ error: 'Non autorisé' }, { status: 401 });
	const prisma = new PrismaClient();
	const poll = await prisma.poll.create({ data: {} });
	return json({ poll });
};
