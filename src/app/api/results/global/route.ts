import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: Request) {
  try {
    const token = req.cookies.get("auth_token")?.value;

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

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const managerNameParam = searchParams.get("managerName");

    const whereClause: any = {
      campaign: { createdBy: userId },
    };

    if (startDateParam && endDateParam) {
      whereClause.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    if (managerNameParam && managerNameParam !== "all") {
      const userCampaigns = await prisma.campaign.findMany({
        where: { createdBy: userId },
        select: { id: true },
      });

      const campaignIds = userCampaigns.map((c) => c.id);

      const pollLinksForManager = await prisma.pollLink.findMany({
        where: {
          campaignId: { in: campaignIds },
          managerName: managerNameParam,
        },
        select: { id: true },
      });

      const pollLinkIds = pollLinksForManager.map((link) => link.id);

      if (pollLinkIds.length === 0) {
        return NextResponse.json(
          {
            totalVotes: 0,
            moodDistribution: [
              {
                name: "Très bien",
                votes: 0,
                fill: "#22c55e",
                emoji: "😄",
              },
              {
                name: "Neutre",
                votes: 0,
                fill: "#38bdf8",
                emoji: "🙂",
              },
              {
                name: "Moyen",
                votes: 0,
                fill: "#f97316",
                emoji: "😕",
              },
              {
                name: "Pas bien",
                votes: 0,
                fill: "#ef4444",
                emoji: "😠",
              },
            ],
            comments: [],
            dominantMood: "N/A",
            dominantMoodEmoji: "🤔",
            participationRate: "0%",
            campaignName: "Toutes les campagnes",
          },
          { status: 200 },
        );
      }

      whereClause.pollLinkId = { in: pollLinkIds };
    }

    const allVotes = await prisma.vote.findMany({
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

    const totalVotes = allVotes.length;

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

    allVotes.forEach((vote) => {
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

    const allCampaigns = await prisma.campaign.findMany({
      where: { createdBy: userId },
      select: { _count: { select: { pollLinks: true } } },
    });

    const totalPossiblePollLinks = allCampaigns.reduce(
      (sum, c) => sum + c._count.pollLinks,
      0,
    );
    const participationRate =
      totalPossiblePollLinks > 0
        ? (totalVotes / totalPossiblePollLinks) * 100
        : 0;

    return NextResponse.json(
      {
        totalVotes,
        moodDistribution,
        comments,
        dominantMood: dominantMood?.name || "N/A",
        dominantMoodEmoji: dominantMood?.emoji || "🤔",
        participationRate: `${participationRate.toFixed(0)}%`,
        campaignName: "Toutes les campagnes",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des résultats globaux" },
      { status: 500 },
    );
  }
}
