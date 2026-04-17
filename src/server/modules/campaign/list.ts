import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import { CACHE_TTL, campaignListKey } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";
import type { CampaignListItem, CampaignPrisma } from "./types";

type ListParams = {
  prisma: CampaignPrisma;
  userId: string;
};

async function archiveExpiredCampaigns(prisma: CampaignPrisma, userId: string) {
  const result = await prisma.campaign.updateMany({
    where: {
      createdBy: userId,
      archived: false,
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      archived: true,
    },
  });

  if (result.count > 0) {
    await invalidateCampaignCaches(userId);
  }
}

async function fetchCampaigns(prisma: CampaignPrisma, userId: string) {
  return prisma.campaign.findMany({
    where: { createdBy: userId },
    include: {
      _count: {
        select: {
          pollLinks: true,
          votes: true,
          services: true,
          serviceVotes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function buildItem(
  prisma: CampaignPrisma,
  campaign: Awaited<ReturnType<typeof fetchCampaigns>>[number],
): Promise<CampaignListItem> {
  const isManagerCampaign = campaign.type === "MANAGER_LINKS";
  const totalTargets = isManagerCampaign ? campaign._count.pollLinks : campaign._count.services;

  const votedTargets = isManagerCampaign
    ? (
        await prisma.vote.groupBy({
          by: ["pollLinkId"],
          where: { campaignId: campaign.id },
        })
      ).length
    : (
        await prisma.serviceVote.groupBy({
          by: ["campaignServiceId"],
          where: { campaignId: campaign.id },
        })
      ).length;

  const participationRate = totalTargets > 0 ? Math.round((votedTargets / totalTargets) * 100) : 0;

  return {
    id: campaign.id,
    name: campaign.name,
    segmentCount: totalTargets,
    campaignType: campaign.type,
    creationDate: campaign.createdAt.toLocaleDateString("fr-FR"),
    participationRate,
    totalVotes: campaign._count.votes + campaign._count.serviceVotes,
    archived: campaign.archived || false,
    commentsRequired: campaign.commentsRequired,
    allowMultipleVotes: campaign.allowMultipleVotes,
    publicResultsEnabled: campaign.publicResultsEnabled,
  };
}

export async function listCampaigns({ prisma, userId }: ListParams): Promise<CampaignListItem[]> {
  const cacheKey = campaignListKey(userId);
  const cached = await getCacheValue<CampaignListItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  await archiveExpiredCampaigns(prisma, userId);
  const campaigns = await fetchCampaigns(prisma, userId);
  const items = await Promise.all(campaigns.map((campaign) => buildItem(prisma, campaign)));
  await setCacheValue(cacheKey, items, CACHE_TTL.campaignListSeconds);
  return items;
}
