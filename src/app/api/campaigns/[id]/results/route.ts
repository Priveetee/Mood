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

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const managerNameParam = searchParams.get("managerName");

    const whereClause: any = {
      campaignId: campaignId,
    };

    if (startDateParam && endDateParam) {
      whereClause.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    if (managerNameParam && managerNameParam !== "all") {
      const pollLinksForManager = await prisma.pollLink.findMany({
        where: {
          campaignId: campaignId,
          managerName: managerNameParam,
        },
        select: { id: true },
      });
      whereClause.pollLinkId = {
        in: pollLinksForManager.map((link) => link.id),
      };
    }

    const votes = await prisma.vote.findMany({
      where: whereClause,
      include: {
        pollLink: {
          select: {
            managerName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalVotes = votes.length;

    const moodCounts = {
      green: 0,
      blue: 0,
      yellow: 0,
      red: 0,
    };

    const comments: {
      user: string;
      manager: string;
      comment: string;
      mood: string;
    }[] = [];

    votes.forEach((vote) => {
      if (vote.mood === "green") moodCounts.green++;
      else if (vote.mood === "blue") moodCounts.blue++;
      else if (vote.mood === "yellow") moodCounts.yellow++;
      else if (vote.mood === "red") moodCounts.red++;

      if (vote.comment) {
        comments.push({
          user: vote.ipAddress,
          manager: vote.pollLink.managerName,
          comment: vote.comment,
          mood: vote.mood,
        });
      }
    });

    const moodDistribution = [
      {
        name: "Très bien",
        votes: moodCounts.green,
        fill: "#22c55e",
        emoji: "😄",
      },
      { name: "Neutre", votes: moodCounts.blue, fill: "#38bdf8", emoji: "🙂" },
      { name: "Moyen", votes: moodCounts.yellow, fill: "#f97316", emoji: "😕" },
      { name: "Pas bien", votes: moodCounts.red, fill: "#ef4444", emoji: "😠" },
    ];

    const dominantMood = moodDistribution.sort((a, b) => b.votes - a.votes)[0];
    const participationRate =
      votes.length > 0 ? (votes.length / (campaignId * 5)) * 100 : 0;

    return NextResponse.json(
      {
        totalVotes,
        moodDistribution,
        comments,
        dominantMood: dominantMood.name,
        dominantMoodEmoji: dominantMood.emoji,
        participationRate: `${participationRate.toFixed(0)}%`,
        campaignName: campaign.name,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des résultats" },
      { status: 500 },
    );
  }
}
