import { TRPCError } from "@trpc/server";
import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import { pollInfoKey } from "@/server/modules/cache/keys";
import { deleteCacheKeys } from "@/server/modules/cache/store";
import { CAMPAIGN_ERRORS } from "./constants";
import type { CampaignPrisma } from "./types";

type AddServiceParams = {
  prisma: CampaignPrisma;
  campaignId: number;
  serviceName: string;
  userId: string;
};

export async function addCampaignService({
  prisma,
  campaignId,
  serviceName,
  userId,
}: AddServiceParams): Promise<{ id: string; name: string }> {
  const trimmedName = serviceName.trim();
  if (trimmedName.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Nom de service invalide." });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
    select: {
      id: true,
      type: true,
      archived: true,
      accessLinks: { where: { type: "VOTE" }, select: { token: true } },
    },
  });

  if (!campaign) {
    throw new TRPCError({ code: "NOT_FOUND", message: CAMPAIGN_ERRORS.notFound });
  }

  if (campaign.type !== "SERVICE_UNIQUE") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cette campagne est en mode manager.",
    });
  }

  if (campaign.archived) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Impossible d'ajouter un service sur une campagne archivee.",
    });
  }

  const duplicate = await prisma.campaignService.findFirst({
    where: {
      campaignId,
      name: { equals: trimmedName, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new TRPCError({ code: "CONFLICT", message: CAMPAIGN_ERRORS.serviceExists });
  }

  const createdService = await prisma.campaignService.create({
    data: { campaignId, name: trimmedName },
    select: { id: true, name: true },
  });

  await invalidateCampaignCaches(userId, campaignId);

  const pollInfoKeys = campaign.accessLinks.map((link) => pollInfoKey(link.token));
  await deleteCacheKeys(pollInfoKeys);

  return createdService;
}
