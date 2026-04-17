import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import type { CampaignLinkItem, CampaignPrisma } from "./types";
import { buildPublicResultsUrl } from "./url";

type TogglePublicResultsParams = {
  prisma: CampaignPrisma;
  campaignId: number;
  userId: string;
  enabled: boolean;
  request?: Request | null;
};

async function getOwnedServiceCampaign(prisma: CampaignPrisma, campaignId: number, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
    select: {
      id: true,
      type: true,
      archived: true,
      expiresAt: true,
      publicResultsEnabled: true,
    },
  });

  if (!campaign) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Campagne introuvable" });
  }

  if (campaign.type !== "SERVICE_UNIQUE") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "La publication publique est reservee aux campagnes par service.",
    });
  }

  return campaign;
}

export async function toggleCampaignPublicResults({
  prisma,
  campaignId,
  userId,
  enabled,
  request,
}: TogglePublicResultsParams): Promise<{ enabled: boolean; link: CampaignLinkItem | null }> {
  await getOwnedServiceCampaign(prisma, campaignId, userId);

  if (!enabled) {
    await prisma.$transaction([
      prisma.campaign.update({ where: { id: campaignId }, data: { publicResultsEnabled: false } }),
      prisma.campaignAccessLink.deleteMany({ where: { campaignId, type: "PUBLIC_READ_ONLY" } }),
    ]);

    await invalidateCampaignCaches(userId, campaignId);
    return { enabled: false, link: null };
  }

  const existing = await prisma.campaignAccessLink.findFirst({
    where: { campaignId, type: "PUBLIC_READ_ONLY" },
    select: { id: true, token: true },
  });

  const publicLink =
    existing ??
    (await prisma.campaignAccessLink.create({
      data: { campaignId, type: "PUBLIC_READ_ONLY", token: nanoid(16) },
      select: { id: true, token: true },
    }));

  await prisma.campaign.update({ where: { id: campaignId }, data: { publicResultsEnabled: true } });
  await invalidateCampaignCaches(userId, campaignId);

  return {
    enabled: true,
    link: {
      id: publicLink.id,
      kind: "service-public",
      label: "Lien public lecture seule",
      url: buildPublicResultsUrl(publicLink.token, request),
    },
  };
}
