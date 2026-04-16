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
  const totalPollLinks = campaign._count.pollLinks;
  const votedManagers = await prisma.vote.groupBy({
    by: ["pollLinkId"],
    where: { campaignId: campaign.id },
  });
  const votedManagersCount = votedManagers.length;
  const participationRate =
    totalPollLinks > 0 ? Math.round((votedManagersCount / totalPollLinks) * 100) : 0;

  return {
    id: campaign.id,
    name: campaign.name,
    managerCount: totalPollLinks,
    creationDate: campaign.createdAt.toLocaleDateString("fr-FR"),
    participationRate,
    totalVotes: campaign._count.votes,
    archived: campaign.archived || false,
    commentsRequired: campaign.commentsRequired,
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
