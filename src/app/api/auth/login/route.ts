import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
