import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let userId: number;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      userId = payload.userId as number;
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { name, managers } = await req.json();

    if (!name || !Array.isArray(managers) || managers.length === 0) {
      return NextResponse.json({ error: 'Nom de campagne et au moins un manager sont requis' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        createdBy: userId,
      },
    });

    const pollLinksData = managers.map((managerName: string) => ({
      campaignId: campaign.id,
      token: uuidv4(),
      managerName,
    }));

    const pollLinks = await prisma.pollLink.createManyAndReturn({
      data: pollLinksData,
    });

    const generatedLinks = pollLinks.map((link) => {
      const manager = managers.find((m: string) => m === link.managerName);
      return {
        managerName: manager,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/poll/${link.token}`,
      };
    });

    return NextResponse.json(
      {
        campaignId: campaign.id,
        campaignName: campaign.name,
        generatedLinks,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la campagne' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let userId: number;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      userId = payload.userId as number;
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

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
        createdAt: 'desc',
      },
    });

    const formattedCampaigns = campaigns.map((campaign) => {
      const totalPollLinks = campaign._count.pollLinks;
      const totalVotes = campaign._count.votes;
      const progress = totalPollLinks > 0 ? Math.round((totalVotes / totalPollLinks) * 100) : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        managerCount: totalPollLinks,
        creationDate: campaign.createdAt.toLocaleDateString('fr-FR'),
        progress,
        totalVotes,
      };
    });

    return NextResponse.json(formattedCampaigns, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des campagnes' }, { status: 500 });
  }
}
