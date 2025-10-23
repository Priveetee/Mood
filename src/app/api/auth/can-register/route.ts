import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      canRegister: userCount === 0,
    });
  } catch (error) {
    console.error("Erreur dans can-register API:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification des utilisateurs." },
      { status: 500 },
    );
  }
}
