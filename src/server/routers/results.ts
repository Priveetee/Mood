import { z } from "zod";
import {
  CACHE_TTL,
  filteredResultsKey,
  resultCampaignOptionsKey,
  resultManagerOptionsKey,
} from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import { buildResultsWhereClause } from "@/server/modules/results/filters";
import { buildResultsSummary } from "@/server/modules/results/summary";
import { protectedProcedure, router } from "../trpc";

type CampaignOption = {
  id: number;
  name: string;
};

type FilteredResultsPayload = ReturnType<typeof buildResultsSummary> & {
  participationRate: string;
  campaignName: string;
};

export const resultsRouter = router({
  getCampaignOptions: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = resultCampaignOptionsKey(ctx.session.user.id);
    const cached = await getCacheValue<CampaignOption[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const campaigns = await ctx.prisma.campaign.findMany({
      where: { createdBy: ctx.session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    await setCacheValue(cacheKey, campaigns, CACHE_TTL.resultOptionsSeconds);
    return campaigns;
  }),

  getManagerOptions: protectedProcedure
    .input(
      z.object({
        campaignId: z.union([z.number(), z.literal("all")]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = resultManagerOptionsKey(ctx.session.user.id, input.campaignId);
      const cached = await getCacheValue<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

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

      const managerOptions = managers.map((m) => m.managerName);
      await setCacheValue(cacheKey, managerOptions, CACHE_TTL.resultOptionsSeconds);
      return managerOptions;
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
      const cacheKey = filteredResultsKey(
        ctx.session.user.id,
        input.campaignId,
        input.managerName,
        input.dateRange.from,
        input.dateRange.to,
      );
      const cached = await getCacheValue<FilteredResultsPayload>(cacheKey);
      if (cached) {
        return cached;
      }

      const whereClause = buildResultsWhereClause(ctx.session.user.id, {
        campaignId: input.campaignId,
        managerName: input.managerName,
        dateRange: input.dateRange,
      });

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
      const summary = buildResultsSummary(votes);

      const payload = {
        ...summary,
        participationRate: "N/A",
        campaignName,
      };

      await setCacheValue(cacheKey, payload, CACHE_TTL.filteredResultsSeconds);
      return payload;
    }),
});
