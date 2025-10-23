import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: Request) {
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

    const userCampaigns = await prisma.campaign.findMany({
      where: { createdBy: userId },
      select: { id: true },
    });

    const campaignIds = userCampaigns.map((c) => c.id);

    const managers = await prisma.pollLink.findMany({
      where: { campaignId: { in: campaignIds } },
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
