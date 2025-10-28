import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ link: string }> },
) {
  try {
    const resolvedParams = await params;
    const pollToken = resolvedParams.link;

    if (!pollToken) {
      return NextResponse.json(
        { error: "Token de sondage manquant" },
        { status: 400 },
      );
    }

    const pollLink = await prisma.pollLink.findUnique({
      where: { token: pollToken },
      select: {
        managerName: true,
        campaign: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!pollLink) {
      return NextResponse.json(
        { error: "Lien de sondage invalide ou expiré" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        managerName: pollLink.managerName,
        campaignName: pollLink.campaign.name,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Erreur serveur lors de la récupération des informations du sondage",
      },
      { status: 500 },
    );
  }
}
