import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CACHE_TTL, pollInfoKey } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import { submitVote } from "@/server/modules/poll/submit";
import { getPublicServiceResultsByToken } from "@/server/modules/results/public-service-results";
import { procedure, router } from "../trpc";

type PollInfoPayload = {
  managerName: string | null;
  campaignName: string;
  commentsRequired: boolean;
  campaignType: "MANAGER_LINKS" | "SERVICE_UNIQUE";
  allowMultipleVotes: boolean;
  services: Array<{ id: string; name: string }>;
};

function isCampaignClosed(campaign: { archived: boolean; expiresAt: Date | null }) {
  return campaign.archived || (campaign.expiresAt ? campaign.expiresAt < new Date() : false);
}

export const pollRouter = router({
  getInfoByToken: procedure.input(z.string()).query(async ({ ctx, input: pollToken }) => {
    const cacheKey = pollInfoKey(pollToken);
    const cached = await getCacheValue<PollInfoPayload>(cacheKey);
    if (cached) {
      return cached;
    }

    const pollLink = await ctx.prisma.pollLink.findUnique({
      where: { token: pollToken },
      select: {
        managerName: true,
        campaign: {
          select: {
            name: true,
            commentsRequired: true,
            type: true,
            allowMultipleVotes: true,
            archived: true,
            expiresAt: true,
          },
        },
      },
    });

    if (pollLink) {
      if (isCampaignClosed(pollLink.campaign)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lien de sondage invalide ou expire" });
      }

      const payload: PollInfoPayload = {
        managerName: pollLink.managerName,
        campaignName: pollLink.campaign.name,
        commentsRequired: pollLink.campaign.commentsRequired,
        campaignType: pollLink.campaign.type,
        allowMultipleVotes: pollLink.campaign.allowMultipleVotes,
        services: [],
      };

      await setCacheValue(cacheKey, payload, CACHE_TTL.pollInfoSeconds);
      return payload;
    }

    const accessLink = await ctx.prisma.campaignAccessLink.findUnique({
      where: { token: pollToken },
      select: {
        type: true,
        campaign: {
          select: {
            name: true,
            commentsRequired: true,
            type: true,
            allowMultipleVotes: true,
            archived: true,
            expiresAt: true,
            services: {
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            },
          },
        },
      },
    });

    if (
      !accessLink ||
      accessLink.type !== "VOTE" ||
      accessLink.campaign.type !== "SERVICE_UNIQUE"
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lien de sondage invalide ou expire" });
    }

    if (isCampaignClosed(accessLink.campaign)) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lien de sondage invalide ou expire" });
    }

    const payload: PollInfoPayload = {
      managerName: null,
      campaignName: accessLink.campaign.name,
      commentsRequired: accessLink.campaign.commentsRequired,
      campaignType: accessLink.campaign.type,
      allowMultipleVotes: accessLink.campaign.allowMultipleVotes,
      services: accessLink.campaign.services,
    };

    await setCacheValue(cacheKey, payload, CACHE_TTL.pollInfoSeconds);
    return payload;
  }),

  submitVote: procedure
    .input(
      z.object({
        pollToken: z.string(),
        mood: z.enum(["green", "blue", "yellow", "red"]),
        comment: z.string().optional(),
        serviceId: z.string().optional(),
        voterKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      submitVote({
        prisma: ctx.prisma,
        pollToken: input.pollToken,
        mood: input.mood,
        comment: input.comment,
        serviceId: input.serviceId,
        voterKey: input.voterKey,
      }),
    ),

  getPublicResultsByToken: procedure
    .input(z.string())
    .query(async ({ ctx, input }) => getPublicServiceResultsByToken(ctx.prisma, input)),
});
