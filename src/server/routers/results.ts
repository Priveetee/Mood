import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const resultsRouter = router({
  getCampaignOptions: protectedProcedure.query(async ({ ctx }) => {
    const campaigns = await ctx.prisma.campaign.findMany({
      where: { createdBy: ctx.session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return campaigns;
  }),

  getManagerOptions: protectedProcedure
    .input(
      z.object({
        campaignId: z.union([z.number(), z.literal("all")]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaignWhereClause =
        input.campaignId === "all"
          ? { createdBy: ctx.session.user.id }
          : { id: input.campaignId, createdBy: ctx.session.user.id };

      const campaigns = await ctx.prisma.campaign.findMany({
        where: campaignWhereClause,
        select: { id: true },
      });
      const campaignIds = campaigns.map((c) => c.id);

      const managers = await ctx.prisma.pollLink.findMany({
        where: { campaignId: { in: campaignIds } },
        distinct: ["managerName"],
        select: { managerName: true },
        orderBy: { managerName: "asc" },
      });

      return managers.map((m) => m.managerName);
    }),

  getFilteredResults: protectedProcedure
    .input(
      z.object({
        campaignId: z.union([z.number(), z.literal("all")]),
        managerName: z.union([z.string(), z.literal("all")]),
        dateRange: z.object({
          from: z.date().optional(),
          to: z.date().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause: Record<string, unknown> = {};

      if (input.campaignId === "all") {
        whereClause.campaign = { createdBy: ctx.session.user.id };
      } else {
        whereClause.campaignId = input.campaignId;
        whereClause.campaign = { createdBy: ctx.session.user.id };
      }

      if (input.dateRange.from && input.dateRange.to) {
        whereClause.createdAt = {
          gte: input.dateRange.from,
          lte: input.dateRange.to,
        };
      }

      if (input.managerName !== "all") {
        whereClause.pollLink = { managerName: input.managerName };
      }

      const votes = await ctx.prisma.vote.findMany({
        where: whereClause,
        include: {
          pollLink: { select: { managerName: true } },
          campaign: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const campaignName =
        input.campaignId === "all"
          ? "Toutes les campagnes"
          : (votes[0]?.campaign.name ?? "Campagne sélectionnée");

      const totalVotes = votes.length;
      const moodCounts = { green: 0, blue: 0, yellow: 0, red: 0 };
      const comments: {
        user: string;
        manager: string;
        comment: string;
        mood: string;
      }[] = [];

      const allVotes = votes.map((vote) => ({
        date: vote.createdAt.toISOString(),
        campaign: vote.campaign.name,
        manager: vote.pollLink.managerName,
        user: "Anonyme",
        mood: vote.mood,
        comment: vote.comment || "",
      }));

      votes.forEach((vote) => {
        moodCounts[vote.mood as keyof typeof moodCounts]++;
        if (vote.comment) {
          comments.push({
            user: "Anonyme",
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
        {
          name: "Neutre",
          votes: moodCounts.blue,
          fill: "#38bdf8",
          emoji: "🙂",
        },
        {
          name: "Moyen",
          votes: moodCounts.yellow,
          fill: "#f97316",
          emoji: "😕",
        },
        {
          name: "Pas bien",
          votes: moodCounts.red,
          fill: "#ef4444",
          emoji: "😠",
        },
      ];

      const dominantMood = [...moodDistribution].sort(
        (a, b) => b.votes - a.votes,
      )[0];

      return {
        totalVotes,
        moodDistribution,
        comments,
        allVotes,
        dominantMood: dominantMood?.name ?? "N/A",
        dominantMoodEmoji: dominantMood?.emoji ?? "🤔",
        participationRate: "N/A",
        campaignName,
      };
    }),
});
