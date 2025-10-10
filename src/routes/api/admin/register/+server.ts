import prisma from '$lib/server/db';
import bcrypt from 'bcrypt';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const userCount = await prisma.user.count();
	if (userCount > 0) {
		return json(
			{ message: "Un compte administrateur existe déjà. L'inscription est fermée." },
			{ status: 403 }
		);
	}

	const { username, password } = await request.json();

	if (!username || !password || password.length < 8) {
		return json(
			{ message: 'Le mot de passe doit contenir au moins 8 caractères.' },
			{ status: 400 }
		);
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	await prisma.user.create({
		data: {
			username,
			passwordHash
		}
	});

	return json({ message: 'Compte créé avec succès.' }, { status: 201 });
};
