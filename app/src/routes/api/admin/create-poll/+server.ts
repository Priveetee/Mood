import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    return json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    const poll = await prisma.poll.create({
      data: {
        expiresAt,
      },
    });

    return json({ success: true, poll }, { status: 201 });
  } catch (error) {
    console.error('Erreur création sondage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
