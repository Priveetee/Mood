import { TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import { invalidateVoteCaches } from "@/server/modules/cache/invalidate";

type SubmitVoteParams = {
  prisma: Context["prisma"];
  pollToken: string;
  mood: "green" | "blue" | "yellow" | "red";
  comment?: string;
};

export async function submitVote({
  prisma,
  pollToken,
  mood,
  comment,
}: SubmitVoteParams): Promise<{ message: string; voteId: number }> {
  const pollLink = await prisma.pollLink.findUnique({
    where: { token: pollToken },
    select: {
      id: true,
      campaignId: true,
      campaign: {
        select: {
          commentsRequired: true,
          createdBy: true,
        },
      },
    },
  });

  if (!pollLink) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Lien de sondage introuvable ou expire",
    });
  }

  if (!pollLink.campaign) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Campagne introuvable",
    });
  }

  const trimmedComment = comment?.trim() ?? "";
  if (pollLink.campaign.commentsRequired && trimmedComment.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Le commentaire est obligatoire pour cette campagne.",
    });
  }

  const existingVote = await prisma.vote.findFirst({
    where: { pollLinkId: pollLink.id },
    select: { id: true },
  });

  if (existingVote) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Vous avez deja participe a ce sondage.",
    });
  }

  const vote = await prisma.vote.create({
    data: {
      pollLinkId: pollLink.id,
      campaignId: pollLink.campaignId,
      mood,
      comment: trimmedComment.length > 0 ? trimmedComment : null,
    },
  });

  await invalidateVoteCaches(pollLink.campaign.createdBy, pollLink.campaignId, pollToken);

  return {
    message: "Votre vote a bien ete enregistre",
    voteId: vote.id,
  };
}
