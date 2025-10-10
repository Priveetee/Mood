import prisma from '$lib/server/db';
import type { RequestHandler } from './$types';

const escapeCsvField = (field: string | null): string => {
	if (field === null || field === undefined) {
		return '';
	}
	const str = String(field);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		return new Response('Non autorisé', { status: 401 });
	}

	const poll = await prisma.poll.findUnique({
		where: { id: params.id },
		include: {
			votes: {
				orderBy: {
					createdAt: 'asc'
				}
			}
		}
	});

	if (!poll) {
		return new Response('Sondage non trouvé', { status: 404 });
	}

	const headers = ['id', 'pollId', 'mood', 'comment', 'createdAt'];
	const csvRows = [headers.join(',')];

	for (const vote of poll.votes) {
		const row = [
			vote.id,
			vote.pollId,
			vote.mood,
			escapeCsvField(vote.comment),
			vote.createdAt.toISOString()
		].join(',');
		csvRows.push(row);
	}

	const csvContent = csvRows.join('\n');

	return new Response(csvContent, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="results-${params.id}.csv"`
		}
	});
};
