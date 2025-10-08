import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    return json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { pollId } = await request.json();

    if (!pollId) {
      return json({ error: 'pollId manquant' }, { status: 400 });
    }

    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: { closed: true },
    });

    return json({ success: true, poll }, { status: 200 });
  } catch (error) {
    console.error('Erreur fermeture sondage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
