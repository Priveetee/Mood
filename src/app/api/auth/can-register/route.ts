import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ canRegister: userCount === 0 });
  } catch (error) {
    return NextResponse.json({ canRegister: false }, { status: 500 });
  }
}
