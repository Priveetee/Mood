import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et password sont requis" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou password incorrect" },
        { status: 401 },
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Email ou password incorrect" },
        { status: 401 },
      );
    }

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
      { status: 200 },
    );
    response.cookies.set("auth_token", token, cookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion" },
      { status: 500 },
    );
  }
}
