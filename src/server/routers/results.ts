import { z } from "zod";
import {
  CACHE_TTL,
  filteredResultsKey,
  resultCampaignOptionsKey,
  resultManagerOptionsKey,
} from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import { getSegmentOptions } from "@/server/modules/results/segments";
import { buildResultsSummary } from "@/server/modules/results/summary";
import { getFilteredVotes } from "@/server/modules/results/votes";
import { protectedProcedure, router } from "../trpc";

type CampaignOption = {
  id: number;
  name: string;
  campaignType: "MANAGER_LINKS" | "SERVICE_UNIQUE";
  archived: boolean;
  expiresAt: Date | null;
  publicResultsEnabled: boolean;
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
      select: {
        id: true,
        name: true,
        type: true,
        archived: true,
        expiresAt: true,
        publicResultsEnabled: true,
      },
      orderBy: { name: "asc" },
    });

    const payload = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      campaignType: campaign.type,
      archived: campaign.archived,
      expiresAt: campaign.expiresAt,
      publicResultsEnabled: campaign.publicResultsEnabled,
    }));

    await setCacheValue(cacheKey, payload, CACHE_TTL.resultOptionsSeconds);
    return payload;
  }),

  getManagerOptions: protectedProcedure
    .input(
      z.object({
        campaignId: z.union([z.number(), z.literal("all")]),
        segmentType: z.enum(["all", "manager", "service"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = resultManagerOptionsKey(
        ctx.session.user.id,
        `${input.campaignId}:${input.segmentType}`,
      );
      const cached = await getCacheValue<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const options = await getSegmentOptions(
        ctx.prisma,
        ctx.session.user.id,
        input.campaignId,
        input.segmentType,
      );
      await setCacheValue(cacheKey, options, CACHE_TTL.resultOptionsSeconds);
      return options;
    }),

  getFilteredResults: protectedProcedure
    .input(
      z.object({
        campaignId: z.union([z.number(), z.literal("all")]),
        managerName: z.union([z.string(), z.literal("all")]),
        segmentType: z.enum(["all", "manager", "service"]),
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
        `${input.segmentType}:${input.managerName}`,
        input.dateRange.from,
        input.dateRange.to,
      );
      const cached = await getCacheValue<FilteredResultsPayload>(cacheKey);
      if (cached) {
        return cached;
      }

      const queryResult = await getFilteredVotes(ctx.prisma, ctx.session.user.id, {
        campaignId: input.campaignId,
        segment: input.managerName,
        source: input.segmentType,
        dateRange: input.dateRange,
      });

      const summary = buildResultsSummary(queryResult.votes);
      const payload = {
        ...summary,
        participationRate: "N/A",
        campaignName: queryResult.campaignName,
      };

      await setCacheValue(cacheKey, payload, CACHE_TTL.filteredResultsSeconds);
      return payload;
    }),
});
