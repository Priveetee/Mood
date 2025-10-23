import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    let userId: number;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      userId = payload.userId as number;
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const resolvedParams = await params;
    const campaignId = parseInt(resolvedParams.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: "ID de campagne invalide" },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId, createdBy: userId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campagne introuvable ou non autorisée" },
        { status: 404 },
      );
    }

    const managers = await prisma.pollLink.findMany({
      where: { campaignId },
      distinct: ["managerName"],
      select: { managerName: true },
      orderBy: { managerName: "asc" },
    });

    const managerNames = managers.map((m) => m.managerName);

    return NextResponse.json(managerNames, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des managers" },
      { status: 500 },
    );
  }
}
