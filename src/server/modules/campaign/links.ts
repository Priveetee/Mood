import { TRPCError } from "@trpc/server";
import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import { CACHE_TTL, campaignLinksKey } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import { CAMPAIGN_ERRORS } from "./constants";
import type { CampaignLinkItem, CampaignPrisma } from "./types";
import { buildPollUrl } from "./url";

type GetLinksParams = {
  prisma: CampaignPrisma;
  campaignId: number;
  userId: string;
  request?: Request | null;
};

type AddManagerParams = {
  prisma: CampaignPrisma;
  campaignId: number;
  managerName: string;
  userId: string;
  token: string;
  request?: Request | null;
};

async function ensureCampaignOwnership(prisma: CampaignPrisma, campaignId: number, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
  });
  if (!campaign) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: CAMPAIGN_ERRORS.notFound,
    });
  }
  return campaign;
}

export async function getCampaignLinks({
  prisma,
  campaignId,
  userId,
  request,
}: GetLinksParams): Promise<CampaignLinkItem[]> {
  const cacheKey = campaignLinksKey(userId, campaignId);
  const cached = await getCacheValue<CampaignLinkItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
    include: {
      pollLinks: {
        select: {
          id: true,
          managerName: true,
          token: true,
        },
        orderBy: { managerName: "asc" },
      },
    },
  });

  if (!campaign) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: CAMPAIGN_ERRORS.notFound,
    });
  }

  const items = campaign.pollLinks.map((link) => ({
    id: link.id,
    managerName: link.managerName,
    url: buildPollUrl(link.token, request),
  }));

  await setCacheValue(cacheKey, items, CACHE_TTL.campaignLinksSeconds);
  return items;
}

export async function addCampaignManager({
  prisma,
  campaignId,
  managerName,
  userId,
  token,
  request,
}: AddManagerParams): Promise<CampaignLinkItem> {
  await ensureCampaignOwnership(prisma, campaignId, userId);

  const existingLink = await prisma.pollLink.findFirst({
    where: {
      campaignId,
      managerName,
    },
  });

  if (existingLink) {
    throw new TRPCError({
      code: "CONFLICT",
      message: CAMPAIGN_ERRORS.managerExists,
    });
  }

  const newLink = await prisma.pollLink.create({
    data: {
      campaignId,
      managerName,
      token,
    },
  });

  await invalidateCampaignCaches(userId, campaignId);

  return {
    id: newLink.id,
    managerName: newLink.managerName,
    url: buildPollUrl(newLink.token, request),
  };
}

export async function setCampaignArchiveStatus(
  prisma: CampaignPrisma,
  campaignId: number,
  archived: boolean,
  userId: string,
) {
  await ensureCampaignOwnership(prisma, campaignId, userId);
  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { archived },
  });

  await invalidateCampaignCaches(userId, campaignId);
  return { success: true, archived: updatedCampaign.archived };
}
