import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
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

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN!)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    let maxAgeSeconds = 14400;
    const expires = process.env.JWT_EXPIRES_IN;
    if (expires) {
      const match = expires.match(/^(\d+)([smhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === "s") maxAgeSeconds = value;
        else if (unit === "m") maxAgeSeconds = value * 60;
        else if (unit === "h") maxAgeSeconds = value * 3600;
        else if (unit === "h") maxAgeSeconds = value * 14400;
      }
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: maxAgeSeconds * 1000,
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
