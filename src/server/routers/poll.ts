import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CACHE_TTL, pollInfoKey } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import { submitVote } from "@/server/modules/poll/submit";
import { procedure, router } from "../trpc";

type PollInfoPayload = {
  managerName: string;
  campaignName: string;
  commentsRequired: boolean;
};

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
          },
        },
      },
    });

    if (!pollLink) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lien de sondage invalide ou expire",
      });
    }

    const payload = {
      managerName: pollLink.managerName,
      campaignName: pollLink.campaign.name,
      commentsRequired: pollLink.campaign.commentsRequired,
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
      }),
    )
    .mutation(async ({ ctx, input }) =>
      submitVote({
        prisma: ctx.prisma,
        pollToken: input.pollToken,
        mood: input.mood,
        comment: input.comment,
      }),
    ),
});
