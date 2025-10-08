import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    return json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    return json({ polls }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération sondages:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
