import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, username, password, invitationKey } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username et password sont requis" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le password doit avoir au moins 8 caractères" },
        { status: 400 },
      );
    }

    const userCount = await prisma.user.count();
    const canRegister =
      userCount === 0 || invitationKey === process.env.INVITATION_KEY;

    if (!canRegister) {
      return NextResponse.json(
        { error: "Inscription non autorisée" },
        { status: 403 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email ou username déjà utilisé" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: { id: true, email: true, username: true },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000,
      path: "/",
    };

    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, username: user.username },
        token,
      },
      { status: 201 },
    );
    response.cookies.set("auth_token", token, cookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement" },
      { status: 500 },
    );
  }
}
