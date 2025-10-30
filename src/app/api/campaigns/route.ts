import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    let userId: number | undefined;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      if (typeof payload.userId === "number") {
        userId = payload.userId;
      }
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur non trouvé dans le token" },
        { status: 401 },
      );
    }

    const { name, managers, expiresAt } = await req.json();

    if (!name || !Array.isArray(managers) || managers.length === 0) {
      return NextResponse.json(
        { error: "Nom de campagne et au moins un manager sont requis" },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        createdBy: userId,
        archived: false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const pollLinksData = managers.map((managerName: string) => ({
      campaignId: campaign.id,
      token: nanoid(10),
      managerName,
    }));

    await prisma.pollLink.createMany({
      data: pollLinksData,
    });

    const pollLinks = await prisma.pollLink.findMany({
      where: { campaignId: campaign.id },
    });

    const generatedLinks = pollLinks.map((link) => ({
      managerName: link.managerName,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/poll/${link.token}`,
    }));

    return NextResponse.json(
      {
        campaignId: campaign.id,
        campaignName: campaign.name,
        generatedLinks,
      },
      { status: 201 },
    );
  } catch (error) {
    if ((error as any).code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Erreur de clé étrangère : l'utilisateur spécifié n'existe pas.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la campagne" },
      { status: 500 },
    );
  }
}

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

    await prisma.campaign.updateMany({
      where: {
        createdBy: userId,
        archived: false,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        archived: true,
      },
    });

    const campaigns = await prisma.campaign.findMany({
      where: { createdBy: userId },
      include: {
        _count: {
          select: {
            pollLinks: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => {
        const totalPollLinks = campaign._count.pollLinks;
        const totalVotes = campaign._count.votes;

        const votedManagers = await prisma.vote.groupBy({
          by: ["pollLinkId"],
          where: { campaignId: campaign.id },
        });
        const votedManagersCount = votedManagers.length;

        const participationRate =
          totalPollLinks > 0
            ? Math.round((votedManagersCount / totalPollLinks) * 100)
            : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          managerCount: totalPollLinks,
          creationDate: campaign.createdAt.toLocaleDateString("fr-FR"),
          participationRate,
          totalVotes,
          archived: campaign.archived || false,
        };
      }),
    );

    return NextResponse.json(formattedCampaigns, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des campagnes" },
      { status: 500 },
    );
  }
}
