import { TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import { invalidateVoteCaches } from "@/server/modules/cache/invalidate";

type SubmitServiceVoteParams = {
  prisma: Context["prisma"];
  pollToken: string;
  mood: "green" | "blue" | "yellow" | "red";
  serviceId?: string;
  voterKey?: string;
  comment?: string;
};

export async function submitServiceVote({
  prisma,
  pollToken,
  mood,
  serviceId,
  voterKey,
  comment,
}: SubmitServiceVoteParams): Promise<{ message: string; voteId: number }> {
  const accessLink = await prisma.campaignAccessLink.findUnique({
    where: { token: pollToken },
    select: {
      campaignId: true,
      campaign: {
        select: {
          type: true,
          createdBy: true,
          commentsRequired: true,
          allowMultipleVotes: true,
        },
      },
      type: true,
    },
  });

  if (!accessLink || accessLink.type !== "VOTE" || accessLink.campaign.type !== "SERVICE_UNIQUE") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Lien de sondage introuvable ou expire" });
  }

  if (!serviceId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Selectionnez un service." });
  }

  const service = await prisma.campaignService.findFirst({
    where: { id: serviceId, campaignId: accessLink.campaignId },
    select: { id: true },
  });

  if (!service) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Service invalide pour ce sondage." });
  }

  const trimmedComment = comment?.trim() ?? "";
  if (accessLink.campaign.commentsRequired && trimmedComment.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Le commentaire est obligatoire pour cette campagne.",
    });
  }

  if (!accessLink.campaign.allowMultipleVotes) {
    if (!voterKey || voterKey.trim().length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cle de vote manquante." });
    }

    const existingVote = await prisma.serviceVote.findFirst({
      where: { campaignId: accessLink.campaignId, voterKey: voterKey.trim() },
      select: { id: true },
    });

    if (existingVote) {
      throw new TRPCError({ code: "CONFLICT", message: "Vous avez deja participe a ce sondage." });
    }
  }

  const vote = await prisma.$transaction(async (tx) => {
    const createdVote = await tx.serviceVote.create({
      data: {
        campaignId: accessLink.campaignId,
        campaignServiceId: service.id,
        mood,
        comment: trimmedComment.length > 0 ? trimmedComment : null,
        voterKey: voterKey?.trim() ? voterKey.trim() : null,
      },
    });

    await tx.serviceVoteAggregate.upsert({
      where: {
        campaignId_campaignServiceId_mood: {
          campaignId: accessLink.campaignId,
          campaignServiceId: service.id,
          mood,
        },
      },
      update: { voteCount: { increment: 1 } },
      create: {
        campaignId: accessLink.campaignId,
        campaignServiceId: service.id,
        mood,
        voteCount: 1,
      },
    });

    return createdVote;
  });

  await invalidateVoteCaches(accessLink.campaign.createdBy, accessLink.campaignId, pollToken);
  return { message: "Votre vote a bien ete enregistre", voteId: vote.id };
}
