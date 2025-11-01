import { z } from "zod";
import { router, procedure } from "../trpc";

export const pollRouter = router({
  getInfoByToken: procedure
    .input(z.string())
    .query(async ({ ctx, input: pollToken }) => {
      const pollLink = await ctx.prisma.pollLink.findUnique({
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
        throw new Error("Lien de sondage invalide ou expiré");
      }

      return {
        managerName: pollLink.managerName,
        campaignName: pollLink.campaign.name,
      };
    }),

  submitVote: procedure
    .input(
      z.object({
        pollToken: z.string(),
        mood: z.enum(["green", "blue", "yellow", "red"]),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pollLink = await ctx.prisma.pollLink.findUnique({
        where: { token: input.pollToken },
        select: { id: true, campaignId: true },
      });

      if (!pollLink) {
        throw new Error("Lien de sondage introuvable ou expiré");
      }

      const vote = await ctx.prisma.vote.create({
        data: {
          pollLinkId: pollLink.id,
          campaignId: pollLink.campaignId,
          mood: input.mood,
          comment: input.comment || null,
        },
      });

      return { message: "Votre vote a bien été enregistré", voteId: vote.id };
    }),
});
