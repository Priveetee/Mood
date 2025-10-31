import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password, invitationKey } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const userCount = await prisma.user.count();
    const canRegister =
      userCount === 0 || invitationKey === process.env.INVITATION_KEY;

    if (!canRegister) {
      return NextResponse.json(
        { error: "Registration not allowed" },
        { status: 403 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error during registration" },
      { status: 500 },
    );
  }
}
