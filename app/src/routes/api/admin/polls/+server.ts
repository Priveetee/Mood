import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
export const GET = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) return json({ error: 'Non autorisé' }, { status: 401 });
	const prisma = new PrismaClient();
	const polls = await prisma.poll.findMany({
		orderBy: { createdAt: 'desc' },
		include: { _count: { select: { votes: true } } }
	});
	return json({ polls });
};
