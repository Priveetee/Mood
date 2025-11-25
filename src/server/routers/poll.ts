import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
              commentsRequired: true,
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
        commentsRequired: pollLink.campaign.commentsRequired,
      };
    }),

  submitVote: procedure
    .input(
      z.object({
        pollToken: z.string(),
        mood: z.enum(["green", "blue", "yellow", "red"]),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const pollLink = await ctx.prisma.pollLink.findUnique({
        where: { token: input.pollToken },
        select: { id: true, campaignId: true },
      });

      if (!pollLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lien de sondage introuvable ou expiré",
        });
      }

      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: pollLink.campaignId },
        select: { commentsRequired: true },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campagne introuvable",
        });
      }

      const trimmedComment = input.comment?.trim() ?? "";

      if (campaign.commentsRequired && trimmedComment.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le commentaire est obligatoire pour cette campagne.",
        });
      }

      const vote = await ctx.prisma.vote.create({
        data: {
          pollLinkId: pollLink.id,
          campaignId: pollLink.campaignId,
          mood: input.mood,
          comment: trimmedComment.length > 0 ? trimmedComment : null,
        },
      });

      return { message: "Votre vote a bien été enregistré", voteId: vote.id };
    }),
});
